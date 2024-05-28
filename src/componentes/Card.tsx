// src/components/Card.tsx
import React, { useState, forwardRef } from "react";
import { Card as CardType } from "../types";
import Modal from "./Modal";

interface CardProps {
  card: CardType;
  onDelete: (id: string) => void;
  onUpdate: (id: string, newTitle: string, newDescription: string) => void;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ card, onDelete, onUpdate }, ref) => {
    const [isEditing, setIsEditing] = useState(false);

    // Maneja la actualización de la tarjeta
    const handleUpdate = (newTitle: string, newDescription: string) => {
      onUpdate(card.id, newTitle, newDescription);
      setIsEditing(false);
    };

    // Maneja la eliminación de la tarjeta
    const handleDelete = () => {
      onDelete(card.id);
      setIsEditing(false);
    };

    return (
      <div
        ref={ref}
        className="bg-white text-black rounded-lg p-4 mb-2 shadow-md"
      >
        <div onClick={() => setIsEditing(true)}>
          <h3 className="font-bold mb-2">{card.title}</h3>
          <p>{card.description}</p>
        </div>

        <Modal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          onSave={handleUpdate}
          onDelete={handleDelete}
          initialTitle={card.title}
          initialDescription={card.description}
        />
      </div>
    );
  }
);

export default Card;
