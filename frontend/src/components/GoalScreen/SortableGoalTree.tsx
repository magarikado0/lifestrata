import { useState, useMemo } from 'react';
import {
  DndContext, DragOverlay,
  MeasuringStrategy, PointerSensor, TouchSensor,
  closestCenter, useSensor, useSensors,
  type DragEndEvent, type DragMoveEvent, type DragOverEvent, type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { type Goal } from '../../types';
import { SortableGoalItem } from './SortableGoalItem';

const INDENT_WIDTH = 20;

interface FlatItem {
  id: number;
  depth: number;
  parentId: number | null;
  goal: Goal;
}

function flatten(goals: Goal[], parentId: number | null = null, depth = 0): FlatItem[] {
  return [...goals]
    .sort((a, b) => a.order - b.order)
    .flatMap(goal => [
      { id: goal.id, depth, parentId, goal },
      ...(goal.open ? flatten(goal.children, goal.id, depth + 1) : []),
    ]);
}

function getProjection(
  items: FlatItem[],
  activeId: number,
  overId: number,
  dragOffsetLeft: number,
): { depth: number; parentId: number | null } | null {
  const activeIndex = items.findIndex(i => i.id === activeId);
  const overIndex = items.findIndex(i => i.id === overId);
  if (activeIndex === -1 || overIndex === -1) return null;

  const activeItem = items[activeIndex];
  const reordered = arrayMove(items, activeIndex, overIndex);
  const newIndex = reordered.findIndex(i => i.id === activeId);
  const previousItem = reordered[newIndex - 1];
  const nextItem = reordered[newIndex + 1];

  const dragDepth = Math.round(dragOffsetLeft / INDENT_WIDTH);
  const projectedDepth = activeItem.depth + dragDepth;
  const maxDepth = previousItem ? previousItem.depth + 1 : 0;
  const minDepth = nextItem ? nextItem.depth : 0;
  const depth = Math.min(maxDepth, Math.max(minDepth, projectedDepth));

  function getParentId(): number | null {
    if (depth === 0 || !previousItem) return null;
    if (depth === previousItem.depth) return previousItem.parentId;
    if (depth > previousItem.depth) return previousItem.id;
    for (let i = newIndex - 1; i >= 0; i--) {
      if (reordered[i].depth === depth - 1 && reordered[i].id !== activeId) {
        return reordered[i].id;
      }
    }
    return null;
  }

  return { depth, parentId: getParentId() };
}

interface Props {
  goals: Goal[];
  onToggle: (id: number) => void;
  onAddChild: (parentId: number, text: string) => void;
  onUpdate: (id: number, updates: { deadline?: string | null; deadlineMinutes?: number | null }) => void;
  onDelete: (id: number) => void;
  onUnlink: (goalId: number, taskId: number) => void;
  onReparent: (id: number, newParentId: number | null, newOrder: number) => void;
}

export function SortableGoalTree({
  goals, onToggle, onAddChild, onUpdate, onDelete, onUnlink, onReparent,
}: Props) {
  const [activeId, setActiveId] = useState<number | null>(null);
  const [overId, setOverId] = useState<number | null>(null);
  const [offsetLeft, setOffsetLeft] = useState(0);

  const flatItems = useMemo(() => flatten(goals), [goals]);
  const itemIds = useMemo(() => flatItems.map(i => i.id), [flatItems]);

  const projected = activeId != null && overId != null
    ? getProjection(flatItems, activeId, overId, offsetLeft)
    : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
  );

  function handleDragStart({ active }: DragStartEvent) {
    setActiveId(active.id as number);
    setOverId(active.id as number);
  }

  function handleDragMove({ delta }: DragMoveEvent) {
    setOffsetLeft(delta.x);
  }

  function handleDragOver({ over }: DragOverEvent) {
    setOverId(over ? over.id as number : null);
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (projected && over) {
      const activeIdx = flatItems.findIndex(i => i.id === active.id);
      const overIdx = flatItems.findIndex(i => i.id === over.id);
      const reordered = arrayMove(flatItems, activeIdx, overIdx);
      const newIdx = reordered.findIndex(i => i.id === active.id);

      // Order among new siblings
      const newOrder = reordered
        .slice(0, newIdx)
        .filter(i => i.parentId === projected.parentId)
        .length;

      const currentItem = flatItems[activeIdx];
      const changed =
        active.id !== over.id ||
        projected.parentId !== currentItem.parentId;

      if (changed) {
        onReparent(active.id as number, projected.parentId, newOrder);
      }
    }
    reset();
  }

  function reset() {
    setActiveId(null);
    setOverId(null);
    setOffsetLeft(0);
  }

  if (goals.length === 0) {
    return (
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 0', fontSize: 14 }}>
        ゴールを追加してみましょう
      </div>
    );
  }

  const activeItem = activeId != null ? flatItems.find(i => i.id === activeId) : undefined;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={{ droppable: { strategy: MeasuringStrategy.Always } }}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={reset}
    >
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div>
          {flatItems.map((item, idx) => {
            const effectiveDepth = item.id === activeId && projected ? projected.depth : item.depth;
            const nextItem = flatItems[idx + 1];
            const isLastInGroup = effectiveDepth > 0 && (!nextItem || nextItem.depth === 0);
            return (
              <SortableGoalItem
                key={item.id}
                id={item.id}
                goal={item.goal}
                depth={effectiveDepth}
                isLastInGroup={isLastInGroup}
                onToggle={onToggle}
                onAddChild={onAddChild}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onUnlink={onUnlink}
              />
            );
          })}
        </div>
      </SortableContext>
      <DragOverlay>
        {activeItem ? (
          <SortableGoalItem
            id={activeItem.id}
            goal={activeItem.goal}
            depth={projected ? projected.depth : activeItem.depth}
            isOverlay
            onToggle={() => {}}
            onAddChild={() => {}}
            onUpdate={() => {}}
            onDelete={() => {}}
            onUnlink={() => {}}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
