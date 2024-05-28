// src/graphql/queries.ts
import { gql } from "@apollo/client";

export const GET_CARD = gql`
  query GetCard($id: ID!) {
    card(id: $id) {
      id
      title
      description
      status
    }
  }
`;

export const GET_CARDS = gql`
  query GetCards {
    cardsByStatus {
      id
      title
      description
      status
    }
  }
`;
