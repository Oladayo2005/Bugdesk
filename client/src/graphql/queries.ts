
import { gql } from "@apollo/client";

export const GET_ME_QUERY = gql`
  query GetMe {
    me {
      id
      name
      email
      role
      avatar
      isActive
    }
  }
`;

export const GET_BUGS_QUERY = gql`
  query GetBugs {
    bugs {
      id
      title
      description
      priority
      severity
      status
      createdBy {
        id
        name
        email
      }
      assignedTo {
        id
        name
        email
      }
    }
  }
`;

// GET DEVELOPERS QUERY
export const GET_DEVELOPERS_QUERY = gql`
  query GetDevelopers {
    developers {
      id
      name
      email
      role
      avatar
      isActive
    }
  }
`;

// GET COMMENTS QUERY
export const GET_COMMENTS_QUERY = gql`
  query GetComments($bugId: ID!) {
    comments(bugId: $bugId) {
      id
      content
      author {
        id
        name
        email
      }
      createdAt
    }
  }
`;

// GET SINGLE BUG QUERY
export const GET_BUG_QUERY = gql`
  query GetBug($id: ID!) {
    bug(id: $id) {
      id
      title
      description
      priority
      severity
      status
      createdAt
      updatedAt
      createdBy {
        id
        name
        email
      }
      assignedTo {
        id
        name
        email
      }
    }
  }
`;

// GET ACTIVITY HISTORY QUERY
export const GET_ACTIVITIES_QUERY = gql`
  query GetActivities($bugId: ID!) {
    activities(bugId: $bugId) {
      id
      action
      description
      metadata
      createdAt
      performedBy {
        id
        name
        email
      }
      bug {
        id
        title
      }
    }
  }
`;


export const GET_RECENT_ACTIVITIES_QUERY = gql`
  query GetRecentActivities($limit: Int) {
    recentActivities(limit: $limit) {
      id
      action
      description
      metadata
      createdAt
      performedBy {
        id
        name
        email
      }
      bug {
        id
        title
      }
    }
  }
`;


export const GET_MY_ASSIGNED_BUGS_QUERY = gql`
  query GetMyAssignedBugs {
    myAssignedBugs {
      id
      title
      description
      priority
      severity
      status
      createdBy {
        id
        name
        email
      }
      assignedTo {
        id
        name
        email
      }
    }
  }
`;
