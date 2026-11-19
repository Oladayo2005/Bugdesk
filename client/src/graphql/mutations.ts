
import { gql } from "@apollo/client";

// ==========================================
// AUTHENTICATION MUTATIONS
// ==========================================

// REGISTER MUTATION
export const REGISTER_MUTATION = gql`
  mutation Register(
    $name: String!
    $email: String!
    $password: String!
    $role: String!
  ) {
    register(
      name: $name
      email: $email
      password: $password
      role: $role
    ) {
      email
      message
      purpose
    }
  }
`;

// VERIFY REGISTRATION MUTATION
export const VERIFY_REGISTRATION_MUTATION = gql`
  mutation VerifyRegistration(
    $email: String!
    $code: String!
  ) {
    verifyRegistration(
      email: $email
      code: $code
    ) {
      token
      user {
        id
        name
        email
        role
        avatar
        isActive
        emailVerified
      }
    }
  }
`;

// LOGIN MUTATION
export const LOGIN_MUTATION = gql`
  mutation Login(
    $email: String!
    $password: String!
  ) {
    login(
      email: $email
      password: $password
    ) {
      email
      message
      purpose
    }
  }
`;

// VERIFY LOGIN MUTATION
export const VERIFY_LOGIN_MUTATION = gql`
  mutation VerifyLogin(
    $email: String!
    $code: String!
  ) {
    verifyLogin(
      email: $email
      code: $code
    ) {
      token
      user {
        id
        name
        email
        role
        avatar
        isActive
        emailVerified
      }
    }
  }
`;

// RESEND VERIFICATION CODE MUTATION
export const RESEND_VERIFICATION_CODE_MUTATION = gql`
  mutation ResendVerificationCode(
    $email: String!
    $purpose: String!
  ) {
    resendVerificationCode(
      email: $email
      purpose: $purpose
    ) {
      email
      message
      purpose
    }
  }
`;

// FORGOT PASSWORD MUTATION
export const FORGOT_PASSWORD_MUTATION = gql`
  mutation ForgotPassword($email: String!) {
    forgotPassword(email: $email) {
      email
      message
      purpose
    }
  }
`;

// RESET PASSWORD MUTATION
export const RESET_PASSWORD_MUTATION = gql`
  mutation ResetPassword(
    $email: String!
    $code: String!
    $newPassword: String!
  ) {
    resetPassword(
      email: $email
      code: $code
      newPassword: $newPassword
    )
  }
`;

// ==========================================
// BUG MUTATIONS
// ==========================================

// CREATE BUG MUTATION
export const CREATE_BUG_MUTATION = gql`
  mutation CreateBug($input: CreateBugInput!) {
    createBug(input: $input) {
      id
      title
      description
      priority
      severity
      status
    }
  }
`;

// UPDATE BUG DETAILS MUTATION
export const UPDATE_BUG_MUTATION = gql`
  mutation UpdateBug(
    $bugId: ID!
    $input: UpdateBugInput!
  ) {
    updateBug(
      bugId: $bugId
      input: $input
    ) {
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

// UPDATE BUG STATUS MUTATION
export const UPDATE_BUG_STATUS_MUTATION = gql`
  mutation UpdateBugStatus(
    $bugId: ID!
    $status: String!
  ) {
    updateBugStatus(
      bugId: $bugId
      status: $status
    ) {
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

// ASSIGN BUG MUTATION
export const ASSIGN_BUG_MUTATION = gql`
  mutation AssignBug(
    $bugId: ID!
    $developerId: ID!
  ) {
    assignBug(
      bugId: $bugId
      developerId: $developerId
    ) {
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

// DELETE BUG MUTATION
export const DELETE_BUG_MUTATION = gql`
  mutation DeleteBug($bugId: ID!) {
    deleteBug(bugId: $bugId)
  }
`;

// ==========================================
// COMMENT MUTATIONS
// ==========================================

// CREATE COMMENT MUTATION
export const CREATE_COMMENT_MUTATION = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
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

// DELETE COMMENT MUTATION
export const DELETE_COMMENT_MUTATION = gql`
  mutation DeleteComment($commentId: ID!) {
    deleteComment(commentId: $commentId)
  }
`;

// UPDATE COMMENT MUTATION
export const UPDATE_COMMENT_MUTATION = gql`
  mutation UpdateComment(
    $commentId: ID!
    $content: String!
  ) {
    updateComment(
      commentId: $commentId
      content: $content
    ) {
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
