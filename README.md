# DevQuote Mobile

## 🎯 Propósito
Aplicação mobile nativa (iOS/Android) em React Native/Expo para gestão de tarefas, projetos e entregas. Versão móvel do sistema DevQuote com foco em consulta e criação rápida de demandas.

## 🛠️ Stack Tecnológica
- **React Native 0.81.4** + **Expo ~54.0** (nova arquitetura habilitada)
- **React 19.1.0** + **TypeScript 5.9.2** (strict mode)
- **React Navigation 7.x** (Stack, Drawer, Bottom Tabs, Top Tabs)
- **Zustand 5.0.8** (state management global - auth)
- **React Hook Form 7.62** + **Yup 1.7** (formulários e validação)
- **Axios 1.11** (cliente HTTP com interceptors)
- **React Native Paper 5.14** (componentes Material Design)
- **AsyncStorage** (storage local seguro)
- **date-fns 4.1** (manipulação de datas)

## 📁 Estrutura do Projeto
```
src/
├── components/
│   ├── navigation/      # CustomDrawerContent
│   └── ui/              # Button, Card, Input, LoadingSpinner, SelectModal, FilePicker
├── constants/           # Colors, Spacing, Typography, API Config
├── navigation/          # AppNavigator + Stack Navigators (Task, Project, Requester)
├── screens/             # Telas organizadas por módulo
│   ├── auth/            # LoginScreen
│   ├── dashboard/       # DashboardScreen
│   ├── deliveries/      # DeliveryListScreen
│   ├── profile/         # ProfileScreen
│   ├── projects/        # List, Create, Edit
│   ├── requesters/      # List, Create, Edit
│   └── tasks/           # List, Create, Edit
├── services/
│   ├── api/             # authService, taskService, projectService, deliveryService
│   └── storage/         # AsyncStorage wrapper
├── store/               # authStore.ts (Zustand)
├── types/               # TypeScript types (auth, task, project, delivery, requester)
└── utils/               # toast.ts
```

## 🔑 Funcionalidades Implementadas

### Autenticação (100% Completo)
- Login com usuário/senha
- Tokens JWT (access + refresh) armazenados em AsyncStorage
- Refresh automático de token via interceptor Axios
- Validação de sessão ao iniciar app
- Logout com limpeza de dados
- Sistema de permissões por perfil (ADMIN, MANAGER, USER, CUSTOM)
- Interceptor de erro 401 com retry automático

### Navegação (100% Completo)
- **Drawer Navigator** customizado com gradiente
- Stack navigators aninhados para cada módulo
- Headers customizados
- Avatar do usuário no drawer
- Botão de logout destacado
- Versão do app no footer

### Gestão de Tarefas (80% Completo)
- ✅ Lista com paginação infinita
- ✅ Busca por título, código e solicitante
- ✅ Filtros: prioridade (LOW, MEDIUM, HIGH, URGENT), tipo (BUG, ENHANCEMENT, NEW_FEATURE), com/sem subtarefas
- ✅ Ordenação: data (recente/antiga), título (A-Z, Z-A), prioridade (alta-baixa, baixa-alta)
- ✅ Badge de prioridade colorido
- ✅ Pull-to-refresh
- ✅ Loading states
- ⚠️ Criação/edição estruturadas mas incompletas
- ⚠️ Visualização de subtarefas não finalizada

### Gestão de Projetos (70% Completo)
- ✅ Lista de projetos
- ✅ Busca por nome e repositório
- ✅ Pull-to-refresh
- ⚠️ CRUD estruturado mas não finalizado

### Gestão de Solicitantes (50% Completo)
- ✅ Estrutura de telas criada
- ⚠️ Implementação básica, CRUD incompleto

### Dashboard (70% Completo)
- ✅ Cards de estatísticas (tarefas, entregas, projetos)
- ✅ Contadores coloridos
- ✅ Pull-to-refresh
- ⚠️ Usando dados mock (API não integrada)

### Entregas (30% Completo)
- ✅ Tela básica criada
- ✅ Serviço completo estruturado
- ⚠️ CRUD na UI não implementado

### Perfil do Usuário (40% Completo)
- ✅ Tela criada
- ⚠️ Edição de perfil e senha não implementadas

## 🎨 Design System

### Componentes UI Customizados
- **Button**: variantes (primary, secondary, outline, ghost, danger), tamanhos (sm, md, lg), loading/disabled
- **Input**: variantes (default, filled, outlined), validação visual, ícones left/right, helper text
- **Card**: variantes (default, elevated, outlined), padding customizável
- **LoadingSpinner**: overlay opcional, texto customizável
- **SelectModal**: bottom sheet com animações
- **FilePicker**: seleção de documentos com preview

### Paleta de Cores
```typescript
primary: #3b82f6, primaryDark: #1e40af
secondary: #8b5cf6
success: #10b981, warning: #f59e0b, error: #ef4444, danger: #dc2626
```

### Espaçamento
```typescript
xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 40, xxxl: 48
```

### Tipografia
```typescript
fontSize: xs: 10, sm: 12, base: 14, lg: 16, xl: 18, xxl: 20, xxxl: 24
headings: h1: 32, h2: 28, h3: 24, h4: 20, h5: 18, h6: 16
```

### UI/UX
- Material Design (React Native Paper)
- Drawer com gradiente e avatar
- FAB (Floating Action Button) para ações principais
- Pull-to-refresh em todas as listas
- Toast notifications (success, error, info, warning)
- Loading states visuais
- Animações suaves
- Bordas arredondadas (12px)
- Sombras elevadas em cards

## 🔒 Segurança
- **JWT tokens** armazenados em AsyncStorage
- **Bearer token** injetado automaticamente nas requisições
- **Refresh automático** em erro 401
- **Logout automático** se refresh falhar
- **Validação de sessão** ao iniciar app
- **Timeout**: 10s nas requisições
- **Retry**: até 3 tentativas em caso de falha

## ⚙️ Configuração

### API
Base URL configurável em `src/services/api/client.ts`:
- **Desenvolvimento**: ngrok tunnel `https://c52a065e80ce.ngrok-free.app/api`
- **Produção**: não configurado ainda

### Expo (app.json)
```json
{
  "name": "DevQuote Mobile",
  "slug": "devquote-mobile",
  "version": "1.0.0",
  "newArchEnabled": true,
  "primaryColor": "#3b82f6",
  "android": { "package": "com.devquote.mobile" },
  "ios": { "bundleIdentifier": "com.devquote.mobile" }
}
```

## 🚀 Build e Deploy

### Scripts NPM
```bash
npm start              # Servidor Expo
npm run android        # Abrir no Android
npm run ios            # Abrir no iOS
npm run web            # Versão web (experimental)
npm run lint           # ESLint
npm run type-check     # Validação TypeScript
```

### Build de Produção
- **EAS Build**: não configurado ainda
- **Assets**: ícones e splash screen presentes
- **Bundle ID Android**: `com.devquote.mobile`
- **Bundle ID iOS**: `com.devquote.mobile`

### Requisitos
- Node.js 18+
- Expo CLI
- Android Studio (Android) ou Xcode (iOS)
- Dispositivo físico ou emulador

## 📊 Status Atual

### ✅ Completo (100%)
- Estrutura base do projeto e organização
- Sistema de autenticação completo
- Navegação (Drawer, Stack)
- Componentes UI reutilizáveis
- API client com interceptors
- Refresh token automático
- Storage local (AsyncStorage)

### 🚧 Parcialmente Completo (50-80%)
- Dashboard (70% - usando mock data)
- Tarefas (80% - lista completa, CRUD incompleto)
- Projetos (70% - lista completa, CRUD incompleto)
- Solicitantes (50% - estrutura básica)

### ❌ Não Implementado
- Upload de arquivos
- Cache offline
- Notificações push
- Deep linking
- Onboarding inicial
- Esqueci minha senha
- Alteração de senha
- Testes unitários/E2E
- EAS Build configurado
- Ambiente de produção definido

### 📝 Funcionalidades Críticas Pendentes
1. Completar telas Create/Edit de Tarefas e Projetos
2. Integrar Dashboard com API real (remover mock data)
3. Implementar upload de arquivos para entregas
4. Adicionar validação em todos os formulários
5. Implementar tela de detalhes de Tarefa
6. Adicionar loading states em todas as operações
7. Implementar cache offline (React Query)
8. Configurar EAS Build para produção
9. Adicionar testes básicos

## 💡 Contexto de Uso
Aplicação mobile nativa para consumir a API REST do devquote-backend. Foco em **consulta rápida** de tarefas, entregas e projetos, além de **criação rápida** de demandas no campo. Interface otimizada para uso mobile com gestos nativos e navegação intuitiva.

## 🔗 Integração com Backend
- Base URL: configurável por ambiente
- Interceptors para auth e refresh token automático
- Timeout: 10s
- Retry: 3 tentativas
- Endpoints principais:
  - `/auth/*` (login, logout, refresh, validate)
  - `/tasks` (CRUD, estatísticas, subtarefas)
  - `/projects` (CRUD)
  - `/deliveries` (CRUD, estatísticas, agrupamento por tarefa)

## 📈 Próximos Passos Recomendados
1. Completar funcionalidades CRUD pendentes (alta prioridade)
2. Integrar todas as telas com API real
3. Implementar validação completa de formulários
4. Configurar EAS Build para distribuição
5. Adicionar testes unitários
6. Implementar cache offline
7. Adicionar notificações push
8. Criar tela de onboarding
9. Implementar dark mode

## 📦 Estimativa de Completude
**~60-65% completo**. Base sólida e arquitetura bem definida, mas necessita finalização de funcionalidades CRUD e integração completa com backend.
