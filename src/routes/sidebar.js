/**
 * ⚠ These are used just to render the Sidebar!
 * You can include any link here, local or external.
 *
 * If you're looking to actual Router routes, go to
 * `routes/index.js`
 */
const routes = [
  {
    path: '/app/users',
    icon: 'Users',
    name: 'Users',
    permissions: ['admin'],
  },
  {
    path: '/app/servers',
    icon: 'Stack',
    name: 'Servers',
    permissions: ['admin', 'ops', 'user'],
  },
  {
    path: '/app/about',
    icon: 'At',
    name: 'About',
    permissions: ['admin', 'ops', 'user'],
  },
]

export default routes
