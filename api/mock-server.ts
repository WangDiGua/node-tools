import { User, VectorItem, BackgroundTask, SystemLog, Role } from '../types';

// Mock Data Interfaces
interface MockUser extends User {
  password?: string;
}

interface Menu {
  id: number;
  name: string;
  path: string;
  visible: boolean;
  roles: string[];
  children?: Menu[];
}

interface IpRecord {
  id: string;
  ip: string;
  location: string;
  status: 'allowed' | 'blocked';
  accessCount: number;
  lastAccess: string;
}

// --- In-Memory Database ---
const db = {
  users: [
    { id: '1', username: 'admin', password: '123', email: 'admin@vector.com', role: 'admin', status: 'active', avatar: 'AD', phone: '13800000001', gender: 'male', age: 30, lastLogin: new Date().toISOString() },
    { id: '2', username: 'editor', password: '123', email: 'editor@vector.com', role: 'editor', status: 'active', avatar: 'ED', phone: '13900000002', gender: 'female', age: 28, lastLogin: new Date().toISOString() },
    { id: '3', username: 'viewer', password: '123', email: 'viewer@vector.com', role: 'viewer', status: 'active', avatar: 'VI', phone: '13700000003', gender: 'other', age: 25, lastLogin: new Date().toISOString() },
  ] as MockUser[],

  menus: [
    { id: 1, name: '仪表盘', path: '/dashboard', visible: true, roles: ['admin', 'editor', 'viewer'] },
    { id: 2, name: '向量管理', path: '/vector', visible: true, roles: ['admin', 'editor'] },
    { id: 3, name: '向量搜索', path: '/vector-search', visible: true, roles: ['admin', 'editor', 'viewer'] },
    { id: 4, name: '知识库配置', path: '/kb/config', visible: true, roles: ['admin', 'editor'] },
    { id: 5, name: '知识库检索', path: '/kb/retrieval', visible: true, roles: ['admin', 'editor', 'viewer'] },
    { id: 6, name: '大模型输出清洁', path: '/tools/llm-clean', visible: true, roles: ['admin', 'editor'] },
    { id: 7, name: '菜单管理', path: '/settings/menus', visible: true, roles: ['admin'] },
    { id: 8, name: '角色管理', path: '/settings/roles', visible: true, roles: ['admin'] },
    { id: 9, name: '用户管理', path: '/settings/users', visible: true, roles: ['admin'] },
    { id: 10, name: '系统安全', path: '/settings/security', visible: true, roles: ['admin'] },
    { id: 11, name: '系统日志', path: '/settings/logs', visible: true, roles: ['admin'] },
  ] as Menu[],

  roles: [
      { id: '1', name: '超级管理员', description: '拥有所有权限', permissions: ['all'] },
      { id: '2', name: '编辑人员', description: '负责数据维护', permissions: ['vector.read', 'vector.write'] },
      { id: '3', name: '只读访客', description: '仅供查看', permissions: ['vector.read'] },
  ] as Role[],

  ips: [
      { id: '1', ip: '192.168.1.10', location: '内部网络', status: 'allowed', accessCount: 1200, lastAccess: new Date().toISOString() },
      { id: '2', ip: '202.100.20.5', location: '北京', status: 'blocked', accessCount: 5, lastAccess: new Date().toISOString() },
  ] as IpRecord[],

  vectors: Array.from({ length: 12 }).map((_, i) => ({
    id: `vec_${i + 1}`,
    title: `企业知识库_Wiki_${i + 1}`,
    content: 'Mock content...',
    dimensions: 1536,
    source: i % 2 === 0 ? 'MySQL: products' : 'PDF: manual.pdf',
    status: i % 5 === 0 ? 'error' : 'indexed',
    isMultiTable: i % 3 === 0,
    selectedFields: 'title, content',
    isEnabled: true,
    joinRules: i % 3 === 0 ? JSON.stringify({ type: 'one_to_one', conditions: [{ leftFieldId: 'id', rightFieldId: 'user_id' }] }) : undefined,
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    updatedBy: 'admin',
    cronConfig: { enabled: false, expression: '' }
  })) as VectorItem[],

  tasks: [
      { id: 't1', name: '索引构建: Wiki_Base', status: 'In Progress', progress: 45, startTime: new Date().toISOString() }
  ] as BackgroundTask[],

  logs: Array.from({ length: 20 }).map((_, i) => ({
      id: `log_${i}`,
      action: i % 2 === 0 ? 'LOGIN' : 'VECTOR_UPDATE',
      module: 'Core',
      type: i % 5 === 0 ? 'error' : 'operation',
      user: 'admin',
      ip: '127.0.0.1',
      details: 'Mock Log Details...',
      status: i % 5 === 0 ? 'failure' : 'success',
      timestamp: new Date(Date.now() - i * 100000).toISOString()
  })) as SystemLog[],

  // Wizard Mock Data
  databases: [
      { id: 'db1', name: 'Product DB (MySQL)', type: 'mysql' },
      { id: 'db2', name: 'User Logs (Mongo)', type: 'mongo' }
  ],
  tables: [
      { id: 't1', name: 'users', rows: 1000, hasPrimaryKey: true },
      { id: 't2', name: 'orders', rows: 5000, hasPrimaryKey: true },
      { id: 't3', name: 'logs_temp', rows: 0, hasPrimaryKey: false }, // No PK
  ],
  fields: [
      { id: 'f1', name: 'id', type: 'INT' },
      { id: 'f2', name: 'username', type: 'VARCHAR' },
      { id: 'f3', name: 'bio', type: 'TEXT' }
  ]
};

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockRequest = async (config: { url: string; method: string; data?: any; params?: any }) => {
  await delay(300); // 300ms latency
  const { url, method, data, params } = config;
  console.log(`[Mock API] ${method.toUpperCase()} ${url}`, data || params);

  // ================= 1. 登录模块 =================
  if (url === '/auth/captcha' && method === 'get') {
    return { code: 200, data: { key: 'uuid-123', image: 'data:image/svg+xml;base64,PHN2Zy4uLj4=' }, message: 'success' };
  }
  if (url === '/auth/login' && method === 'post') {
    const u = db.users.find(x => x.username === data.username && x.password === data.password);
    if (u) {
       const { password, ...safeUser } = u;
       return { code: 200, data: { token: 'mock-jwt', user: safeUser }, message: 'success' };
    }
    return { code: 401, message: '用户名或密码错误' };
  }
  if (url === '/auth/me' && method === 'get') {
    const { password, ...safeUser } = db.users[0];
    // Filter menus based on role (Mock logic: admin gets all)
    const menus = db.menus.filter(m => m.roles.includes(safeUser.role));
    return { code: 200, data: { user: safeUser, menus }, message: 'success' };
  }

  // ================= 2. 个人中心 =================
  if (url === '/profile' && method === 'get') {
      const { password, ...safeUser } = db.users[0];
      return { code: 200, data: safeUser, message: 'success' };
  }
  if (url === '/profile' && method === 'put') {
      db.users[0] = { ...db.users[0], ...data };
      return { code: 200, message: '更新成功' };
  }

  // ================= 3. 仪表盘 =================
  if (url === '/dashboard/stats') {
      return { code: 200, data: { totalVectors: 15200, dailyQueries: 340, activeNodes: 3, errors: 1, trend: [] }, message: 'success' };
  }
  if (url === '/dashboard/resources') {
      return { code: 200, data: { cpu: 45, memory: 60, disk: 30 }, message: 'success' };
  }
  if (url === '/dashboard/tasks') {
      return { code: 200, data: db.tasks, message: 'success' };
  }
  if (url === '/dashboard/nodes') {
      return { code: 200, data: [{ ip: '192.168.1.1', status: 'active', load: '40%' }], message: 'success' };
  }

  // ================= 4. 向量管理 =================
  if (url === '/vectors' && method === 'get') {
      let list = [...db.vectors];
      if (params?.status && params.status !== 'all') list = list.filter(i => i.status === params.status);
      if (params?.keyword) list = list.filter(i => i.title.includes(params.keyword));
      // Pagination logic skipped for brevity, returning slice
      return { code: 200, data: { list: list.slice(0, 10), total: list.length }, message: 'success' };
  }
  if (url.match(/^\/vectors\/.*\/status$/) && method === 'put') {
      // Toggle Status
      const id = url.split('/')[2];
      const item = db.vectors.find(i => i.id === id);
      if (item) item.isEnabled = data.isEnabled;
      return { code: 200, message: '状态已更新' };
  }
  if (url === '/vectors' && method === 'delete') {
      // Batch delete
      db.vectors = db.vectors.filter(v => !data.ids.includes(v.id));
      return { code: 200, message: '删除成功' };
  }
  if (url === '/vectors' && method === 'post') { // Create (Wizard Final Step)
      return { code: 200, message: '任务创建成功', data: { taskId: 't_new' } }; // Actually starts background task
  }
  if (url.match(/^\/vectors\/.*\/sync-config$/) && method === 'post') {
      const id = url.split('/')[2];
      const item = db.vectors.find(i => i.id === id);
      if (item) item.cronConfig = data;
      return { code: 200, message: '配置已更新' };
  }
  if (url === '/vectors/check-name' && method === 'post') {
      const exists = db.vectors.some(v => v.title === data.title);
      return { code: 200, data: { exists }, message: 'success' };
  }
  if (url.match(/^\/vectors\/[^\/]+$/) && method === 'put') { // Edit Title
      const id = url.split('/')[2];
      const item = db.vectors.find(i => i.id === id);
      if (item) item.title = data.title;
      return { code: 200, message: '更新成功' };
  }
  if (url === '/vectors/export') {
      return { code: 200, data: new Blob(['mock-excel']), message: 'success' };
  }
  // Wizard APIs
  if (url === '/vectors/wizard/databases') return { code: 200, data: db.databases, message: 'success' };
  if (url === '/vectors/wizard/tables') return { code: 200, data: db.tables, message: 'success' };
  if (url === '/vectors/wizard/fields') return { code: 200, data: db.fields, message: 'success' };

  // ================= 5. 向量搜索 =================
  if (url === '/vectors/simple-list') { // Dropdown list
      return { code: 200, data: db.vectors.map(v => ({ id: v.id, title: v.title })), message: 'success' };
  }
  if (url === '/search/vector') {
      return { code: 200, data: [
          { content: 'Result 1 for ' + data.query, score: 0.95, source: 'doc1.pdf' },
          { content: 'Result 2 for ' + data.query, score: 0.88, source: 'doc2.pdf' },
      ], message: 'success' };
  }

  // ================= 6. 系统配置 =================
  // 6.1 Menus
  if (url === '/settings/menus' && method === 'get') return { code: 200, data: db.menus, message: 'success' };
  if (url.startsWith('/settings/menus/') && method === 'put') {
      const id = parseInt(url.split('/').pop()!);
      const idx = db.menus.findIndex(m => m.id === id);
      if (idx > -1) db.menus[idx] = { ...db.menus[idx], ...data };
      return { code: 200, message: '更新成功' };
  }

  // 6.2 Roles
  if (url === '/settings/roles' && method === 'get') return { code: 200, data: db.roles, message: 'success' };
  if (url === '/settings/roles' && method === 'post') {
      db.roles.push({ ...data, id: Date.now().toString(), permissions: [] });
      return { code: 200, message: '创建成功' };
  }
  if (url.includes('/permissions') && method === 'put') {
      // Update perms
      const id = url.split('/')[3];
      const role = db.roles.find(r => r.id === id);
      if (role) role.permissions = data.permissions;
      return { code: 200, message: '权限已更新' };
  }
  if (url.startsWith('/settings/roles/') && method === 'delete') {
      const id = url.split('/').pop();
      db.roles = db.roles.filter(r => r.id !== id);
      return { code: 200, message: '删除成功' };
  }
  // Generic role update
  if (url.startsWith('/settings/roles/') && method === 'put' && !url.includes('permissions')) {
      const id = url.split('/').pop();
      const idx = db.roles.findIndex(r => r.id === id);
      if (idx > -1) db.roles[idx] = { ...db.roles[idx], ...data };
      return { code: 200, message: '更新成功' };
  }

  // 6.3 Users
  if (url === '/settings/users' && method === 'get') return { code: 200, data: { list: db.users, total: db.users.length }, message: 'success' };
  if (url === '/settings/users' && method === 'post') {
      db.users.push({ ...data, id: Date.now().toString() });
      return { code: 200, message: '创建成功' };
  }
  if (url.includes('/status') && method === 'put' && url.includes('users')) {
      const id = url.split('/')[3];
      const u = db.users.find(u => u.id === id);
      if (u) u.status = data.status;
      return { code: 200, message: '状态更新' };
  }
  if (url.startsWith('/settings/users/') && method === 'delete') {
       db.users = db.users.filter(u => u.id !== url.split('/').pop());
       return { code: 200, message: '删除成功' };
  }
   if (url.startsWith('/settings/users/') && method === 'put') {
       // Edit user
       const id = url.split('/').pop();
       const idx = db.users.findIndex(u => u.id === id);
       if (idx > -1) db.users[idx] = { ...db.users[idx], ...data };
       return { code: 200, message: '更新成功' };
  }

  // 6.4 Security
  if (url === '/settings/ips' && method === 'get') return { code: 200, data: db.ips, message: 'success' };
  if (url === '/settings/ips' && method === 'post') {
      db.ips.push({ ...data, id: Date.now().toString(), status: 'blocked', accessCount: 0, lastAccess: '' });
      return { code: 200, message: '添加成功' };
  }
  if (url.includes('/settings/ips/') && method === 'put') {
      const id = url.split('/')[3];
      const ip = db.ips.find(i => i.id === id);
      if (ip) ip.status = data.status;
      return { code: 200, message: '状态更新' };
  }

  // 6.5 Logs
  if (url === '/settings/logs' && method === 'get') return { code: 200, data: { list: db.logs, total: db.logs.length }, message: 'success' };
  if (url.startsWith('/settings/logs/') && method === 'get') {
      const id = url.split('/').pop();
      return { code: 200, data: { details: JSON.stringify(db.logs.find(l => l.id === id) || {}, null, 2) }, message: 'success' };
  }
  if (url === '/settings/logs' && method === 'delete') {
      db.logs = db.logs.filter(l => !data.ids.includes(l.id));
      return { code: 200, message: '删除成功' };
  }
  if (url === '/settings/logs/retention' && method === 'post') {
      return { code: 200, message: '策略已保存' };
  }

  return { code: 404, message: 'API Endpoint Not Found in Mock Server' };
};
