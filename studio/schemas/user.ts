// studio/schemas/user.ts
export default {
  name: 'user',
  title: 'User',
  type: 'document',
  fields: [
    {name: 'uid', title: 'User ID', type: 'string', required: true},
    {name: 'name', title: 'Name', type: 'string'},
    {name: 'email', title: 'Email', type: 'string'},
    {name: 'profileImage', title: 'Profile Image', type: 'image'},
  ],
}
