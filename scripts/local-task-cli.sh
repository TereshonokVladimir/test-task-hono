#!/bin/bash

# Local Task CLI - Add/Update/Delete tasks in local KV storage
# For local development without Cloudflare credentials

WORKER_DIR="$(dirname "$0")/../apps/worker"

show_help() {
  echo ""
  echo "📋 Local Task CLI - Manage tasks in local KV storage"
  echo ""
  echo "Usage: ./scripts/local-task-cli.sh <command> [options]"
  echo ""
  echo "Commands:"
  echo "  create <id> <title> <description> [status]   Create a new task"
  echo "  update <id> <title> <description> <status>   Update existing task"
  echo "  delete <id>                                  Delete a task"
  echo "  list                                         List all task keys"
  echo "  get <id>                                     Get task by ID"
  echo "  help                                         Show this help"
  echo ""
  echo "Status values: pending | in_progress | completed | cancelled"
  echo ""
  echo "Examples:"
  echo "  ./scripts/local-task-cli.sh create my-task-1 \"Fix bug\" \"Fix the login issue\" pending"
  echo "  ./scripts/local-task-cli.sh update my-task-1 \"Bug Fixed\" \"Login issue resolved\" completed"
  echo "  ./scripts/local-task-cli.sh delete my-task-1"
  echo "  ./scripts/local-task-cli.sh list"
  echo "  ./scripts/local-task-cli.sh get my-task-1"
  echo ""
}

create_task() {
  local id="$1"
  local title="$2"
  local description="$3"
  local status="${4:-pending}"
  local now=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
  
  local task_json="{\"id\":\"$id\",\"title\":\"$title\",\"description\":\"$description\",\"status\":\"$status\",\"createdAt\":\"$now\",\"updatedAt\":\"$now\"}"
  
  cd "$WORKER_DIR"
  npx wrangler kv key put "tasks:$id" "$task_json" --binding=TASKS_KV --local --preview
  
  echo ""
  echo "✅ Task created!"
  echo "   ID: $id"
  echo "   Title: $title"
  echo "   Status: $status"
  echo "   View: http://localhost:8787/tasks/$id"
}

update_task() {
  local id="$1"
  local title="$2"
  local description="$3"
  local status="$4"
  local now=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
  
  local task_json="{\"id\":\"$id\",\"title\":\"$title\",\"description\":\"$description\",\"status\":\"$status\",\"createdAt\":\"$now\",\"updatedAt\":\"$now\"}"
  
  cd "$WORKER_DIR"
  npx wrangler kv key put "tasks:$id" "$task_json" --binding=TASKS_KV --local --preview
  
  echo ""
  echo "✅ Task updated!"
  echo "   ID: $id"
  echo "   Status: $status"
  echo "   View: http://localhost:8787/tasks/$id"
}

delete_task() {
  local id="$1"
  
  cd "$WORKER_DIR"
  echo "y" | npx wrangler kv key delete "tasks:$id" --binding=TASKS_KV --local --preview
  
  echo ""
  echo "🗑️ Task deleted!"
  echo "   ID: $id"
}

list_tasks() {
  cd "$WORKER_DIR"
  echo ""
  echo "📋 Tasks in local KV:"
  npx wrangler kv key list --binding=TASKS_KV --local --preview
}

get_task() {
  local id="$1"
  
  cd "$WORKER_DIR"
  echo ""
  echo "📋 Task $id:"
  npx wrangler kv key get "tasks:$id" --binding=TASKS_KV --local --preview
}

case "$1" in
  create)
    if [ -z "$2" ] || [ -z "$3" ] || [ -z "$4" ]; then
      echo "❌ Error: create requires id, title, and description"
      echo "Usage: create <id> <title> <description> [status]"
      exit 1
    fi
    create_task "$2" "$3" "$4" "$5"
    ;;
  update)
    if [ -z "$2" ] || [ -z "$3" ] || [ -z "$4" ] || [ -z "$5" ]; then
      echo "❌ Error: update requires id, title, description, and status"
      echo "Usage: update <id> <title> <description> <status>"
      exit 1
    fi
    update_task "$2" "$3" "$4" "$5"
    ;;
  delete)
    if [ -z "$2" ]; then
      echo "❌ Error: delete requires task id"
      exit 1
    fi
    delete_task "$2"
    ;;
  list)
    list_tasks
    ;;
  get)
    if [ -z "$2" ]; then
      echo "❌ Error: get requires task id"
      exit 1
    fi
    get_task "$2"
    ;;
  help|--help|-h|"")
    show_help
    ;;
  *)
    echo "❌ Unknown command: $1"
    show_help
    exit 1
    ;;
esac
