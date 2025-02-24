import React, { useState } from 'react';
import { Pencil, Save, X, Undo2 } from 'lucide-react';

interface EditableStatProps {
  label: string;
  value: number;
  max?: number;
  onChange: (newValue: number) => void;
  onUndo?: () => void;
}

const EditableStat: React.FC<EditableStatProps> = ({ 
  label, 
  value, 
  max, 
  onChange,
  onUndo 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleQuickChange = (delta: number) => {
    const newValue = value + delta;
    if (max !== undefined && newValue > max) return;
    if (newValue < 0) return;
    onChange(newValue);
  };

  const handleSave = () => {
    if (Math.abs(tempValue - value) > 5) {
      setShowConfirm(true);
      return;
    }
    onChange(tempValue);
    setIsEditing(false);
  };

  return (
    <div className="p-4 border rounded-lg shadow bg-white">
      <div className="flex items-center gap-2 mb-2">
        <span className="font-medium">{label}</span>
        {!isEditing && (
          <button 
            onClick={() => setIsEditing(true)}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <Pencil size={16} />
          </button>
        )}
      </div>

      {!isEditing ? (
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">
            {value}{max !== undefined && `/${max}`}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => handleQuickChange(-1)}
              className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              -1
            </button>
            <button
              onClick={() => handleQuickChange(1)}
              className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              +1
            </button>
            {onUndo && (
              <button
                onClick={onUndo}
                className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
                title="Undo last change"
              >
                <Undo2 size={16} />
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <input
            type="number"
            value={tempValue}
            onChange={(e) => setTempValue(Number(e.target.value))}
            className="w-20 p-1 border rounded"
          />
          {max !== undefined && <span className="text-gray-500">/ {max}</span>}
          <button
            onClick={handleSave}
            className="p-1 text-green-600 hover:text-green-700"
          >
            <Save size={16} />
          </button>
          <button
            onClick={() => {
              setIsEditing(false);
              setTempValue(value);
            }}
            className="p-1 text-red-600 hover:text-red-700"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {showConfirm && (
        <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
          <p className="text-sm text-yellow-800">
            Large change detected. Are you sure?
          </p>
          <div className="mt-2 flex gap-2">
            <button
              onClick={() => {
                onChange(tempValue);
                setIsEditing(false);
                setShowConfirm(false);
              }}
              className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600"
            >
              Confirm
            </button>
            <button
              onClick={() => setShowConfirm(false)}
              className="px-2 py-1 bg-gray-100 rounded hover:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditableStat;