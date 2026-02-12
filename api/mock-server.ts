import { User, VectorItem, BackgroundTask, SystemLog, Role } from '../types';
import { generateCaptcha } from '../utils';

// Extended User type for backend mock DB to include password
interface MockUser extends User {
  password?: string;
}

// --- In-Memory Database (Mocking SQL Tables) ---
const db = {
  users: [
    { id: '1', username: 'admin', password: '123', email: 'admin@vector.com', role: 'admin', status: 'active', avatar: 'AD', phone: '13800138000', gender: 'male', age: 30, lastLogin: new Date().toISOString() },
    { id: '2', username: 'editor', password: '123', email: 'editor@vector.com', role: 'editor', status: 'active', avatar: 'ED', phone: '13900139000', gender: 'female', age: 28, lastLogin: new Date().toISOString() },
    { id: '3', username: 'viewer', password: '123', email: 'viewer@vector.com', role: 'viewer', status: 'active', avatar: 'VI', phone: '13700137000', gender: 'other', age: 25, lastLogin: new Date().toISOString() },
  ] as MockUser[],
  
  vectors: Array.from({ length: 12 }).map((_, i) => ({
    id: `vec_${i + 1}`,
    title: `企业知识库_Wiki_${i + 1}`,
    content: 'Mock content...',
    dimensions: 1536,
    source: i % 2 === 0 ? 'MySQL: products' : 'PDF: manual.pdf',
    status: i % 5 === 0 ? 'error' : 'indexed',
    isMultiTable: i % 3 === 0,
    selectedFields: 'title, content, author',
    isEnabled: true,
    joinRules: i % 3 === 0 ? JSON.stringify({ type: 'one_to_one', conditions: [{ leftFieldId: 'id', rightFieldId: 'user_id' }] }) : undefined,
    createdAt: new Date(Date.now() - i * 86400000).toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'admin',
    updatedBy: 'admin',
    cronConfig: { enabled: false, expression: '' }
  })) as VectorItem[],
  
  tasks: [
    { id: 't1', name: '全量索引构建: Wiki', status: 'In Progress', progress: 45, startTime: new Date().toISOString() },
    { id: 't2', name: '数据清洗', status: 'Pending', progress: 0, startTime: new Date().toISOString() },
    { id: 't3', name: '每日备份', status: 'Completed', progress: 100, startTime: new Date(Date.now() - 3600000).toISOString() },
  ] as BackgroundTask[],
  
  roles: [
      { id: '1', name: '超级管理员', description: '拥有所有权限', permissions: ['all'] },
      { id: '2', name: '编辑', description: '管理内容', permissions: ['vector.write', 'kb.manage'] },
      { id: '3', name: '访客', description: '只读权限', permissions: ['dashboard.read'] },
  ] as Role[]
};

// --- Mock Handler Logic ---

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockRequest = async (config: { url: string; method: string; data?: any; params?: any }) => {
  await delay(400); // Simulate network latency

  const { url, method, data, params } = config;
  console.log(`[MockServer] ${method.toUpperCase()} ${url}`, data || params);

  // --- Auth ---
  if (url === '/auth/captcha' && method === 'get') {
    return {
      code: 200,
      data: {
        key: 'mock-uuid-1234',
        // Mock SVG Base64 image
        image: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iNDAiPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNmM2YzZjMiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1zaXplPSIyNCIgZmlsbD0iIzMzMyI+MTIzNDwvdGV4dD48L3N2Zz4=' 
      },
      message: 'success'
    };
  }

  if (url === '/auth/login' && method === 'post') {
    const user = db.users.find(u => u.username === data.username && u.password === data.password);
    if (user) {
      // Strip password before returning
      const { password, ...userInfo } = user;
      return {
        code: 200,
        data: { token: 'mock-jwt-token-xyz', user: userInfo },
        message: '登录成功'
      };
    }
    return { code: 401, message: '用户名或密码错误 (Try: admin/123)' };
  }

  if (url === '/auth/me' && method === 'get') {
    // In real app, verify token from headers
    const user = db.users[0];
    const { password, ...userInfo } = user;
    return {
        code: 200,
        data: { user: userInfo, menus: [] },
        message: 'success'
    };
  }

  // --- Dashboard ---
  if (url === '/dashboard/stats' && method === 'get') {
    return {
      code: 200,
      data: {
        totalVectors: db.vectors.length * 1234,
        dailyQueries: 45231,
        activeNodes: 12,
        errors: 3,
        trend: [
            { name: 'Mon', vectors: 4000, queries: 2400 },
            { name: 'Tue', vectors: 3000, queries: 1398 },
            { name: 'Wed', vectors: 2000, queries: 9800 },
            { name: 'Thu', vectors: 2780, queries: 3908 },
            { name: 'Fri', vectors: 1890, queries: 4800 },
            { name: 'Sat', vectors: 2390, queries: 3800 },
            { name: 'Sun', vectors: 3490, queries: 4300 },
        ]
      },
      message: 'success'
    };
  }

  if (url === '/dashboard/resources' && method === 'get') {
      return {
          code: 200,
          data: { cpu: 45, memory: 62, disk: 28 },
          message: 'success'
      };
  }

  if (url === '/dashboard/tasks' && method === 'get') {
      return { code: 200, data: db.tasks, message: 'success' };
  }

  if (url === '/dashboard/nodes' && method === 'get') {
      return { 
          code: 200, 
          data: [
            { id: 'node-01', ip: '192.168.1.10', status: 'active', load: '12%' },
            { id: 'node-02', ip: '192.168.1.11', status: 'active', load: '45%' },
          ], 
          message: 'success' 
      };
  }

  // --- Vectors ---
  if (url === '/vectors' && method === 'get') {
    let list = [...db.vectors];
    if (params?.keyword) {
      list = list.filter(v => v.title.includes(params.keyword));
    }
    if (params?.status) {
      list = list.filter(v => v.status === params.status);
    }
    // Pagination Logic
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    
    return {
      code: 200,
      data: {
        list: list.slice(start, end),
        total: list.length
      },
      message: 'success'
    };
  }

  if (url === '/vectors' && method === 'post') {
      const newItem = { 
          ...data, 
          id: `vec_${Date.now()}`, 
          status: 'pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: 'admin',
          updatedBy: 'admin',
          source: 'Mock DB',
          isEnabled: true
      };
      db.vectors.unshift(newItem);
      // Simulate task creation
      db.tasks.unshift({
          id: `task_${Date.now()}`,
          name: `向量化: ${newItem.title}`,
          status: 'In Progress',
          progress: 5,
          startTime: new Date().toISOString()
      });
      return { code: 200, data: newItem, message: '创建成功' };
  }

  if (url.startsWith('/vectors/') && method === 'delete') {
      if (!config.data?.ids) {
          const id = url.split('/').pop();
          const idx = db.vectors.findIndex(v => v.id === id);
          if (idx > -1) db.vectors.splice(idx, 1);
          return { code: 200, message: '删除成功' };
      } 
      else {
          db.vectors = db.vectors.filter(v => !config.data.ids.includes(v.id));
          return { code: 200, message: '批量删除成功' };
      }
  }

  if (url.startsWith('/vectors/') && method === 'put') {
      const id = url.split('/')[2];
      if (url.includes('/status')) {
          const v = db.vectors.find(i => i.id === id);
          if (v) v.isEnabled = data.isEnabled;
      } else {
          db.vectors = db.vectors.map(v => v.id === id ? { ...v, ...data } : v);
      }
      return { code: 200, data: {}, message: '更新成功' };
  }

  if (url === '/vectors/check-name' && method === 'post') {
      const exists = db.vectors.some(v => v.title === data.title);
      return { code: 200, data: { exists }, message: 'success' };
  }

  if (url.endsWith('/sync-config') && method === 'post') {
      return { code: 200, message: '同步配置已更新' };
  }

  if (url === '/vectors/export' && method === 'get') {
      return { code: 200, data: new Blob(['mock-excel-data'], { type: 'text/csv' }), message: 'success' };
  }

  // --- Wizard ---
  if (url === '/vectors/wizard/databases') {
      return { 
          code: 200, 
          data: [
              { id: 'db1', name: 'Core DB (MySQL)', type: 'mysql' },
              { id: 'db2', name: 'Logs DB (Mongo)', type: 'mongo' }
          ], 
          message: 'success' 
      };
  }
  // Allow any param for wizard
  if (url === '/vectors/wizard/tables') {
      return { 
          code: 200, 
          data: [
              { id: 't1', name: 'users', rows: 1200, hasPrimaryKey: true },
              { id: 't2', name: 'orders', rows: 50000, hasPrimaryKey: true },
              { id: 't3', name: 'logs', rows: 99999, hasPrimaryKey: false }
          ], 
          message: 'success' 
      };
  }
  if (url === '/vectors/wizard/fields') {
      return { 
          code: 200, 
          data: [
              { id: 'f1', name: 'id', type: 'INT' },
              { id: 'f2', name: 'title', type: 'VARCHAR' },
              { id: 'f3', name: 'description', type: 'TEXT' },
              { id: 'f4', name: 'user_id', type: 'INT' }
          ], 
          message: 'success' 
      };
  }

  // --- Settings ---
  if (url === '/settings/users' && method === 'get') {
      // Remove passwords from list
      const safeUsers = db.users.map(({password, ...u}) => u);
      return { code: 200, data: { list: safeUsers, total: safeUsers.length }, message: 'success' };
  }
  if (url === '/settings/users' && method === 'post') {
      const newUser = { ...data, id: Date.now().toString(), lastLogin: '' };
      db.users.push(newUser);
      return { code: 200, data: newUser, message: 'success' };
  }
  
  if (url === '/settings/roles' && method === 'get') {
      return { code: 200, data: db.roles, message: 'success' };
  }

  // Default Fallback
  console.warn(`[MockServer] 404 Not Found: ${method} ${url}`);
  return { code: 404, message: 'Mock API Not Found' };
};