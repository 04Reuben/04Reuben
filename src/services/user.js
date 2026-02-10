const mockUsers = [
  {
    id: 'u_001',
    name: 'Alice',
    email: 'alice@example.com',
    role: 'admin',
    createdAt: '2025-11-02 10:12:00',
  },
  {
    id: 'u_002',
    name: 'Bob',
    email: 'bob@example.com',
    role: 'editor',
    createdAt: '2025-11-03 14:20:00',
  },
  {
    id: 'u_003',
    name: 'Cindy',
    email: 'cindy@example.com',
    role: 'viewer',
    createdAt: '2025-11-05 09:01:00',
  },
  {
    id: 'u_004',
    name: 'David',
    email: 'david@example.com',
    role: 'viewer',
    createdAt: '2025-11-06 18:33:00',
  },
  {
    id: 'u_005',
    name: 'Eve',
    email: 'eve@example.com',
    role: 'editor',
    createdAt: '2025-11-08 11:45:00',
  },
  {
    id: 'u_006',
    name: 'Frank',
    email: 'frank@example.com',
    role: 'admin',
    createdAt: '2025-11-10 16:18:00',
  },
  {
    id: 'u_007',
    name: 'Grace',
    email: 'grace@example.com',
    role: 'viewer',
    createdAt: '2025-11-12 08:09:00',
  },
  {
    id: 'u_008',
    name: 'Henry',
    email: 'henry@example.com',
    role: 'editor',
    createdAt: '2025-11-12 20:05:00',
  },
  {
    id: 'u_009',
    name: 'Iris',
    email: 'iris@example.com',
    role: 'viewer',
    createdAt: '2025-11-15 13:40:00',
  },
  {
    id: 'u_010',
    name: 'Jack',
    email: 'jack@example.com',
    role: 'admin',
    createdAt: '2025-11-18 17:22:00',
  },
]

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function getUsers(params = {}) {
  await delay(600)

  const { name, role, page = 1, pageSize = 10 } = params

  let filtered = [...mockUsers]

  if (name) {
    const nameLower = String(name).trim().toLowerCase()
    filtered = filtered.filter((u) => u.name.toLowerCase().includes(nameLower))
  }

  if (role) {
    filtered = filtered.filter((u) => u.role === role)
  }

  const total = filtered.length
  const start = (page - 1) * pageSize
  const rows = filtered.slice(start, start + pageSize)

  return {
    code: 0,
    data: {
      rows,
      total,
      page,
      pageSize,
    },
  }
}

export async function updateUserRole(id, role) {
  await delay(500)

  const idx = mockUsers.findIndex((u) => u.id === id)
  if (idx === -1) {
    return { code: 404, message: '用户不存在' }
  }

  mockUsers[idx].role = role

  return {
    code: 0,
    data: mockUsers[idx],
  }
}