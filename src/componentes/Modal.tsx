// src/components/Modal.tsx
import React, { useState, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string) => void;
  onDelete: () => void;
  initialTitle: string;
  initialDescription: string;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  initialTitle,
  initialDescription,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTitle(initialTitle);
      setDescription(initialDescription);
    }
  }, [isOpen, initialTitle, initialDescription]);

  if (!isOpen) {
    return null;
  }

  const handleSave = () => {
    onSave(title, description);
    onClose();
  };

  const handleDelete = () => {
    if (confirmingDelete) {
      onDelete();
      onClose();
    } else {
      setConfirmingDelete(true);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-900 rounded-lg p-6 w-1/3">
        <h2 className="text-lg font-bold mb-4 text-white">Edit Card</h2>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Card title"
          className="bg-gray-700 text-white text-sm p-2 w-32 mb-2 rounded-lg"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Card description"
          className="bg-gray-700 text-white text-sm p-2  w-full mb-2 h-24 rounded-lg"
        />
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-2 py-1 text-xs rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className={`${
              confirmingDelete ? "bg-red-700" : "bg-red-500"
            } text-white px-2 py-1 rounded text-xs hover:bg-red-400`}
          >
            {confirmingDelete ? "Click again to confirm" : "Delete"}
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-2 py-1 text-xs rounded hover:bg-blue-400"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;
