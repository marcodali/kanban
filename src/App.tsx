import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import Column from "./componentes/Column";
import { Columns, Card } from "./types";
import { v4 as uuidv4 } from "uuid";
import { GET_CARDS } from "./graphql/queries";
import SkeletonLoader from "./componentes/SkeletonLoader";

const GRAPHQL_URL = process.env.REACT_APP_GRAPHQL_URL || "";

if (!GRAPHQL_URL) {
  throw new Error("GraphQL URL is not defined in environment variables");
}
const initialColumns: Columns = {
  "column-1": { id: "column-1", title: "To Do", cardIds: [] },
  "column-2": { id: "column-2", title: "In Progress", cardIds: [] },
  "column-3": { id: "column-3", title: "Done", cardIds: [] },
};

const initialColumnOrder = ["column-1", "column-2", "column-3"];

const App: React.FC = () => {
  const { loading, error, data } = useQuery(GET_CARDS);
  const [columns, setColumns] = useState(initialColumns);
  const [cards, setCards] = useState<{ [key: string]: Card }>({});

  // Efecto para manejar los datos obtenidos de la consulta GraphQL
  useEffect(() => {
    if (data) {
      const newCards: { [key: string]: Card } = {};
      const newColumns: Columns = {
        "column-1": { id: "column-1", title: "To Do", cardIds: [] },
        "column-2": { id: "column-2", title: "In Progress", cardIds: [] },
        "column-3": { id: "column-3", title: "Done", cardIds: [] },
      };

      data.cardsByStatus.forEach((card: Card) => {
        newCards[card.id] = card;
        switch (card.status) {
          case "To Do":
            newColumns["column-1"].cardIds.push(card.id);
            break;
          case "In Progress":
            newColumns["column-2"].cardIds.push(card.id);
            break;
          case "Done":
            newColumns["column-3"].cardIds.push(card.id);
            break;
          default:
            break;
        }
      });

      setCards(newCards);
      setColumns(newColumns);
    }
  }, [data]);

  // Función para manejar el fin del arrastre de una tarjeta
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = columns[source.droppableId];
    const finish = columns[destination.droppableId];

    // Actualización optimista
    const startCardIds = Array.from(start.cardIds);
    startCardIds.splice(source.index, 1);
    const newStart = {
      ...start,
      cardIds: startCardIds,
    };

    const finishCardIds = Array.from(finish.cardIds);
    finishCardIds.splice(destination.index, 0, draggableId);
    const newFinish = {
      ...finish,
      cardIds: finishCardIds,
    };

    setColumns((prev) => ({
      ...prev,
      [newStart.id]: newStart,
      [newFinish.id]: newFinish,
    }));

    // Actualización del estado de la tarjeta en el backend
    const movedCard = cards[draggableId];
    if (movedCard) {
      const originalStatus = movedCard.status;
      const query = `
        mutation {
          updateCard(id: "${movedCard.id}", title: "${movedCard.title}", description: "${movedCard.description}", status: "${finish.title}") {
            card {
              id
              title
              description
              status
            }
          }
        }
      `;

      try {
        const response = await fetch(GRAPHQL_URL, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ query, variables: null }),
        });

        const result = await response.json();
        console.log("Response data:", result);

        if (result.data) {
          const updatedCard = result.data.updateCard.card;
          setCards((prev) => ({
            ...prev,
            [updatedCard.id]: updatedCard,
          }));
        } else {
          throw new Error("Error updating card");
        }
      } catch (error) {
        console.error("Error updating card:", error);
        // Revertir la actualización optimista si hay un error
        setColumns((prev) => ({
          ...prev,
          [newStart.id]: start,
          [newFinish.id]: finish,
        }));
        setCards((prev) => ({
          ...prev,
          [draggableId]: {
            ...prev[draggableId],
            status: originalStatus,
          },
        }));
      }
    }
  };

  // Función para manejar la adición de una tarjeta
  const handleAddCard = async (columnId: string, title: string) => {
    if (!title.trim()) {
      alert("Card title cannot be empty");
      return;
    }

    const newCardId = uuidv4();

    // Actualización optimista
    const newCard = {
      id: newCardId,
      title,
      description: "",
      status: columns[columnId].title,
    };

    setCards((prev) => ({
      ...prev,
      [newCardId]: newCard,
    }));
    setColumns((prev) => {
      const column = prev[columnId];
      const newCardIds = [...column.cardIds, newCardId];
      const newColumn = { ...column, cardIds: newCardIds };

      return {
        ...prev,
        [columnId]: newColumn,
      };
    });

    const query = `
      mutation {
        createCard(id: "${newCardId}", title: "${title}", description: "", status: "${columns[columnId].title}") {
          card {
            id
            title
            description
            status
          }
        }
      }
    `;

    try {
      const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();
      console.log("Response data:", result);

      if (!result.data) {
        throw new Error("Error creating card");
      }
    } catch (error) {
      console.error("Error creating card:", error);
      // Revertir la actualización optimista si hay un error
      setCards((prev) => {
        const newCards = { ...prev };
        delete newCards[newCardId];
        return newCards;
      });
      setColumns((prev) => {
        const newColumns = { ...prev };
        const column = newColumns[columnId];
        column.cardIds = column.cardIds.filter((id) => id !== newCardId);
        return newColumns;
      });
    }
  };

  // Función para manejar la eliminación de una tarjeta
  const handleDeleteCard = async (cardId: string) => {
    // Actualización optimista
    const cardToDelete = cards[cardId];
    setCards((prev) => {
      const newCards = { ...prev };
      delete newCards[cardId];
      return newCards;
    });
    setColumns((prev) => {
      const newColumns = { ...prev };
      for (const columnId in newColumns) {
        const column = newColumns[columnId];
        column.cardIds = column.cardIds.filter((id) => id !== cardId);
      }
      return newColumns;
    });

    const query = `
      mutation {
        deleteCard(id: "${cardId}") {
          card {
            id
          }
        }
      }
    `;

    try {
      const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();
      console.log("Response data:", result);

      if (!result.data) {
        throw new Error("Error deleting card");
      }
    } catch (error) {
      console.error("Error deleting card:", error);
      // Revertir la actualización optimista si hay un error
      setCards((prev) => ({
        ...prev,
        [cardId]: cardToDelete,
      }));
      setColumns((prev) => {
        const newColumns = { ...prev };
        newColumns[cardToDelete.status].cardIds.push(cardId);
        return newColumns;
      });
    }
  };

  // Función para manejar la actualización de una tarjeta
  const handleUpdateCard = async (
    cardId: string,
    newTitle: string,
    newDescription: string
  ) => {
    // Actualización optimista
    const originalCard = cards[cardId];
    setCards((prev) => ({
      ...prev,
      [cardId]: {
        ...prev[cardId],
        title: newTitle,
        description: newDescription,
      },
    }));

    const query = `
      mutation {
        updateCard(id: "${cardId}", title: "${newTitle}", description: "${newDescription}", status: "${originalCard.status}") {
          card {
            id
            title
            description
            status
          }
        }
      }
    `;

    try {
      const response = await fetch(GRAPHQL_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query }),
      });

      const result = await response.json();
      console.log("Response data:", result);

      if (!result.data) {
        throw new Error("Error updating card");
      }
    } catch (error) {
      console.error("Error updating card:", error);
      // Revertir la actualización optimista si hay un error
      setCards((prev) => ({
        ...prev,
        [cardId]: originalCard,
      }));
    }
  };

  // Renderizar el esqueleto durante la carga
  if (loading)
    return (
      <div className="bg-gradient-to-b from-gray-900 to-gray-600 min-h-screen p-8">
        <SkeletonLoader />
      </div>
    );

  // Mostrar un mensaje de error si ocurre algún error
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-600 min-h-screen p-8">
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex space-x-4">
          {initialColumnOrder.map((columnId) => {
            const column = columns[columnId];
            const cardsInColumn = column.cardIds
              .map((cardId) => cards[cardId])
              .filter((card) => card !== undefined); // Añadir filtro para evitar undefined

            return (
              <Column
                key={column.id}
                column={column}
                cards={cardsInColumn}
                onDelete={handleDeleteCard}
                onUpdate={handleUpdateCard}
                onAddCard={handleAddCard}
              />
            );
          })}
        </div>
      </DragDropContext>
    </div>
  );
};

export default App;
