# DevQuote Mobile

Aplicativo móvel para gestão de tarefas e entregas, desenvolvido com React Native e Expo.

## 🚀 Tecnologias

- **React Native** com Expo managed workflow
- **TypeScript** para type safety
- **React Navigation** para navegação
- **Zustand** para gerenciamento de estado
- **React Hook Form + Yup** para formulários
- **Axios** para comunicação HTTP
- **AsyncStorage** para persistência local

## 📱 Funcionalidades

### Implementadas
- ✅ Autenticação com JWT
- ✅ Dashboard com estatísticas
- ✅ Listagem de tarefas
- ✅ Listagem de entregas
- ✅ Listagem de projetos
- ✅ Perfil do usuário
- ✅ Navegação responsiva

### Planejadas
- 🔲 CRUD completo de tarefas
- 🔲 CRUD completo de entregas
- 🔲 CRUD completo de projetos
- 🔲 Filtros e pesquisa
- 🔲 Notificações push
- 🔲 Modo offline

## 🛠 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app no dispositivo móvel

### Configuração

1. **Clone o repositório:**
   ```bash
   cd devquote-mobile
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as variáveis de ambiente:**
   Crie um arquivo `.env` na raiz do projeto:
   ```env
   EXPO_PUBLIC_API_URL=http://localhost:8080
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm start
   ```

5. **Execute no dispositivo:**
   - Abra o app Expo Go
   - Escaneie o QR code mostrado no terminal

## 🏗 Estrutura do Projeto

```
src/
├── components/
│   └── ui/              # Componentes base (Button, Input, Card, etc)
├── constants/           # Cores, tipografia, espaçamento
├── navigation/          # Configuração de rotas
├── screens/             # Telas organizadas por módulo
│   ├── auth/           # Autenticação
│   ├── dashboard/      # Dashboard principal
│   ├── tasks/          # Gestão de tarefas
│   ├── deliveries/     # Gestão de entregas
│   ├── projects/       # Gestão de projetos
│   └── profile/        # Perfil do usuário
├── services/
│   ├── api/            # Clientes da API
│   └── storage/        # AsyncStorage utilities
├── store/              # Estado global (Zustand)
└── types/              # Tipos TypeScript
```

## 🎨 Design System

### Cores
- **Primária:** #3b82f6 (blue-500)
- **Secundária:** #8b5cf6 (purple-500)
- **Sucesso:** #10b981 (emerald-500)
- **Erro:** #ef4444 (red-500)
- **Aviso:** #f59e0b (amber-500)

### Componentes
- **Button:** Variações primary, secondary, outline
- **Input:** Com validação e ícones
- **Card:** Container com elevação
- **LoadingSpinner:** Indicador de carregamento

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm start            # Inicia o Expo dev server
npm run android      # Executa no Android
npm run ios          # Executa no iOS
npm run web          # Executa no navegador

# Build e Deploy
npm run build        # Build de produção
npm run typecheck    # Verificação de tipos TypeScript
```

## 🔐 Autenticação

O app utiliza JWT para autenticação com:
- **Access Token:** Para requisições autenticadas
- **Refresh Token:** Para renovação automática
- **Persistência:** Tokens armazenados no AsyncStorage

### Fluxo de Autenticação
1. Login com usuário/senha
2. Recebimento dos tokens JWT
3. Armazenamento local dos tokens
4. Renovação automática quando necessário
5. Logout limpa os dados armazenados

## 📊 Estado da Aplicação

Gerenciado com Zustand:
- **AuthStore:** Estado de autenticação e usuário
- **Persistência:** Dados mantidos entre sessões
- **Interceptadores:** Renovação automática de tokens

## 🌐 Integração com API

A comunicação é feita através de serviços organizados por domínio:
- **authService:** Autenticação e perfil
- **taskService:** Gestão de tarefas
- **deliveryService:** Gestão de entregas
- **projectService:** Gestão de projetos

### Configuração da API
- Base URL configurável via variável de ambiente
- Interceptadores para autenticação automática
- Tratamento centralizado de erros
- Retry automático para falhas de rede

## 🧪 Desenvolvimento

### Convenções de Código
- **TypeScript:** Strict mode habilitado
- **Nomenclatura:** camelCase para variáveis, PascalCase para componentes
- **Estrutura:** Componentes organizados por responsabilidade
- **Estilização:** StyleSheet com design system consistente

### Estrutura de Componentes
```typescript
// Exemplo de componente
interface ComponentProps {
  title: string;
  onPress?: () => void;
}

const Component: React.FC<ComponentProps> = ({ title, onPress }) => {
  return (
    <TouchableOpacity onPress={onPress}>
      <Text>{title}</Text>
    </TouchableOpacity>
  );
};
```

## 📱 Compatibilidade

- **iOS:** 13.0+
- **Android:** API 21+ (Android 5.0)
- **Expo SDK:** 51+
- **React Native:** 0.74+

## 🤝 Contribuição

1. Fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Add: nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob licença proprietária. Todos os direitos reservados.

---

**DevQuote Mobile v1.0.0** - Desenvolvido com ❤️ usando React Native