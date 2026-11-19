
const typeDefs = `#graphql

  # USER
  type User {
    id: ID!
    name: String!
    email: String!
    role: String!
    avatar: String
    isActive: Boolean!
    emailVerified: Boolean!
  }

  # BUG
  type Bug {
    id: ID!
    title: String!
    description: String!
    priority: String!
    severity: String!
    status: String!
    createdBy: User!
    assignedTo: User
    project: ID
    createdAt: String!
    updatedAt: String!
  }

  # COMMENT
  type Comment {
    id: ID!
    content: String!
    bug: Bug!
    author: User!
    createdAt: String!
    updatedAt: String!
  }

  # ACTIVITY
  type Activity {
    id: ID!
    bug: Bug!
    performedBy: User!
    action: String!
    description: String!
    metadata: String
    createdAt: String!
  }

  # AUTHENTICATION RESPONSE
  type AuthPayload {
    token: String!
    user: User!
  }

  # VERIFICATION RESPONSE
  type VerificationResponse {
    message: String!
    email: String!
    purpose: String!
  }

  # CLOUDINARY AVATAR UPLOAD RESPONSE
  type AvatarUploadSignature {
    cloudName: String!
    apiKey: String!
    timestamp: Int!
    signature: String!
    folder: String!
    publicId: String!
  }

  # INPUT FOR CREATING A BUG
  input CreateBugInput {
    title: String!
    description: String!
    priority: String
    severity: String
  }

  # INPUT FOR UPDATING A BUG
  input UpdateBugInput {
    title: String!
    description: String!
    priority: String!
    severity: String!
  }

  # INPUT FOR CREATING A COMMENT
  input CreateCommentInput {
    bugId: ID!
    content: String!
  }

  # QUERIES
  type Query {
    hello: String!
    me: User!
    bugs: [Bug!]!
    bug(id: ID!): Bug
    myAssignedBugs: [Bug!]!
    developers: [User!]!
    comments(bugId: ID!): [Comment!]!
    activities(bugId: ID!): [Activity!]!
    recentActivities(limit: Int): [Activity!]!
  }

  # MUTATIONS
  type Mutation {

    # ACCOUNT SETTINGS
    updateProfile(name: String!): User!

    changePassword(
      currentPassword: String!
      newPassword: String!
    ): Boolean!

    # PROFILE AVATAR
    createAvatarUploadSignature: AvatarUploadSignature!
    deleteAccount(currentPassword: String!): Boolean!

    saveAvatar(publicId: String!): User!

    removeAvatar: User!

    # REGISTRATION
    register(
      name: String!
      email: String!
      password: String!
      role: String!
    ): VerificationResponse!

    verifyRegistration(
      email: String!
      code: String!
    ): AuthPayload!

    # LOGIN
    login(
      email: String!
      password: String!
    ): VerificationResponse!

    verifyLogin(
      email: String!
      code: String!
    ): AuthPayload!

    # RESEND VERIFICATION CODE
    resendVerificationCode(
      email: String!
      purpose: String!
    ): VerificationResponse!

    # FORGOT PASSWORD
    forgotPassword(
      email: String!
    ): VerificationResponse!

    # RESET PASSWORD
    resetPassword(
      email: String!
      code: String!
      newPassword: String!
    ): Boolean!

    # BUG MUTATIONS
    createBug(input: CreateBugInput!): Bug!

    updateBug(
      bugId: ID!
      input: UpdateBugInput!
    ): Bug!

    assignBug(
      bugId: ID!
      developerId: ID!
    ): Bug!

    updateBugStatus(
      bugId: ID!
      status: String!
    ): Bug!

    deleteBug(bugId: ID!): Boolean!

    # COMMENT MUTATIONS
    createComment(input: CreateCommentInput!): Comment!

    deleteComment(commentId: ID!): Boolean!

    updateComment(
      commentId: ID!
      content: String!
    ): Comment!
  }
`;

export default typeDefs;
