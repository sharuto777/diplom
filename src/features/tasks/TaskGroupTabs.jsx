import React from "react";

function TaskGroupTabs({
  groups = [],
  activeGroupId,
  setActiveGroupId,
  openGroupModal,
  deleteTaskGroup,
}) {
  function handleWheel(event) {
    if (Math.abs(event.deltaY) > Math.abs(event.deltaX)) {
      event.currentTarget.scrollLeft += event.deltaY;
    }
  }

  return (
    <div className="task-groups-bar" onWheel={handleWheel}>
      <button
        type="button"
        className={
          activeGroupId === "all"
            ? "task-group-tab active"
            : "task-group-tab"
        }
        onClick={() => setActiveGroupId("all")}
      >
        Все задачи
      </button>

      {groups.map((group) => (
        <div
          key={group.id}
          className={
            String(activeGroupId) === String(group.id)
              ? "task-group-tab task-group-tab-with-delete active"
              : "task-group-tab task-group-tab-with-delete"
          }
          style={{
            "--group-color": group.color || "#E6F8FA",
          }}
        >
          <button
            type="button"
            className="task-group-name-btn"
            onClick={() => setActiveGroupId(group.id)}
            title={group.name}
          >
            {group.name}
          </button>

          <button
            type="button"
            className="task-group-delete-btn"
            onClick={(event) => {
              event.stopPropagation();
              deleteTaskGroup(group.id);
            }}
            title="Удалить группу"
            aria-label="Удалить группу"
          >
            ×
          </button>
        </div>
      ))}

      <button
        type="button"
        className="task-group-add"
        onClick={openGroupModal}
      >
        + Группа
      </button>
    </div>
  );
}

export default TaskGroupTabs;