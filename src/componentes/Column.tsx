// src/components/Column.tsx
import React from "react";
import { Droppable, Draggable } from "react-beautiful-dnd";
import { Card as CardType } from "../types";
import Card from "./Card";

interface ColumnProps {
  column: {
    id: string;
    title: string;
    cardIds: string[];
  };
  cards: CardType[];
  onDelete: (id: string) => void;
  onUpdate: (id: string, newTitle: string, newDescription: string) => void;
  onAddCard: (columnId: string, content: string) => void;
}

const Column: React.FC<ColumnProps> = ({
  column,
  cards,
  onDelete,
  onUpdate,
  onAddCard,
}) => {
  const [isAddingCard, setIsAddingCard] = React.useState(false);
  const [newCardContent, setNewCardContent] = React.useState("");

  // Maneja la adición de una tarjeta con validación
  const handleAddCard = () => {
    if (newCardContent.trim() === "") {
      alert("Card title cannot be empty");
      return;
    }
    onAddCard(column.id, newCardContent);
    setNewCardContent("");
    setIsAddingCard(false);
  };

  return (
    <Droppable droppableId={column.id}>
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="bg-gray-800 text-white rounded-lg p-4 w-72 h-auto flex flex-col"
        >
          <h2 className="text-lg font-bold mb-4">{column.title}</h2>
          <div className="flex-1">
            {cards.map((card, index) => (
              <Draggable draggableId={card.id} index={index} key={card.id}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <Card card={card} onDelete={onDelete} onUpdate={onUpdate} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
          {isAddingCard ? (
            <div className="mt-2">
              <input
                type="text"
                value={newCardContent}
                onChange={(e) => setNewCardContent(e.target.value)}
                placeholder="Enter a title for this card..."
                className="bg-gray-700 text-white text-sm p-2 w-46 mb-2 rounded-lg"
              />
              <div className="flex gap-3 mt-2">
                <button
                  onClick={handleAddCard}
                  className="bg-blue-500 text-white px-2 py-1 text-xs rounded hover:bg-blue-400"
                >
                  Add card
                </button>
                <button
                  onClick={() => setIsAddingCard(false)}
                  className="text-red-500 p-1 rounded"
                >
                  X
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingCard(true)}
              className="mt-2 p-2 bg-gray-700 rounded text-white hover:bg-gray-600"
            >
              + Add a card
            </button>
          )}
        </div>
      )}
    </Droppable>
  );
};

export default Column;
