// components/TaskItem.js
export default function TaskItem({ task, onToggle, onDelete }) {
  
    const getCategoryColor = (cat) => {
      switch(cat) {
          case 'Muncă': return 'bg-blue-100 text-blue-800';
          case 'Cumpărături': return 'bg-purple-100 text-purple-800';
          default: return 'bg-gray-100 text-gray-800';
      }
    };

    // Funcția care afișează data frumos pe ecran
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const [year, month, day] = dateString.split('-'); 
        return `${day}/${month}/${year}`;
    };
  
    return (
      <div className={`group bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center transition hover:shadow-md ${task.completed ? 'bg-gray-50' : ''}`}>
        
        <div 
          className="flex items-start gap-3 overflow-hidden cursor-pointer flex-1" 
          onClick={() => onToggle(task)}
        >
          <input 
              type="checkbox" 
              checked={task.completed} 
              readOnly 
              className="mt-1 cursor-pointer w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
          />
          
          <div className="flex flex-col">
              <span className={`text-lg font-medium truncate ${task.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  {task.text}
              </span>
              
              <div className="flex gap-2 mt-1 text-xs">
                  <span className={`px-2 py-0.5 rounded-full ${getCategoryColor(task.category)}`}>
                      {task.category}
                  </span>
                  
                  {task.deadline && (
                      <span className={`flex items-center gap-1 ${task.completed ? 'text-gray-400' : 'text-red-500 font-semibold'}`}>
                          🕒 {formatDate(task.deadline)}
                      </span>
                  )}
              </div>
          </div>
        </div>
  
        <button 
          onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
          }}
          className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full transition opacity-0 group-hover:opacity-100 focus:opacity-100"
        >
            X
        </button>
      </div>
    );
}