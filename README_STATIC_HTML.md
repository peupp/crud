# Sistema de Gestão - Versão HTML/CSS Estática

Esta é uma versão estática em HTML/CSS do projeto completo Sistema de Gestão, convertida do React original.

## Arquivos Incluídos

### Páginas HTML
- `index-static.html` - Página inicial com navegação principal
- `patients-static.html` - Lista e gerenciamento de pacientes
- `clients-static.html` - Lista e gerenciamento de clientes
- `patient-registration-static.html` - Formulário de cadastro de pacientes
- `not-found-static.html` - Página 404

### Arquivos de Estilo e Funcionalidade
- `main.css` - Estilos CSS principais com sistema de design consistente
- `patient-registration.css` - Estilos específicos para formulário de cadastro
- `main.js` - JavaScript para funcionalidades interativas
- `patient-registration.js` - JavaScript específico para o formulário de cadastro

## Como Usar

1. **Abrir localmente:**
   - Abra qualquer arquivo `.html` diretamente no navegador
   - Ou use um servidor local (recomendado):
     ```bash
     # Com Python 3
     python -m http.server 8000
     
     # Com Node.js (http-server)
     npx http-server
     
     # Com PHP
     php -S localhost:8000
     ```

2. **Navegação:**
   - Comece por `index-static.html` para ver a página inicial
   - Use os links de navegação entre as páginas

## Funcionalidades Implementadas

### Design System
- Sistema de cores consistente usando CSS Variables
- Componentes reutilizáveis (botões, cards, tabelas, formulários)
- Design responsivo para desktop e mobile
- Dark/Light mode ready (variáveis preparadas)

### Componentes Interativos
- **Busca e Filtros:** Funcionalidade de pesquisa em tempo real nas listas
- **Modais:** Sistema de modais para formulários e detalhes
- **Formulários:** Validação básica e máscaras de entrada
- **Toasts:** Sistema de notificações
- **Tabelas:** Filtros e paginação simulada

### Páginas

#### 1. Página Inicial (`index-static.html`)
- Layout hero com gradiente
- Cards de navegação para pacientes e clientes
- Design moderno com glassmorphism

#### 2. Lista de Pacientes (`patients-static.html`)
- Tabela com dados de exemplo
- Filtros por nome, convênio, VIP, cidade, estado
- Filtro de aniversariantes por mês
- Botões de ação (exemplo estático)
- Links para formulário de cadastro

#### 3. Lista de Clientes (`clients-static.html`)
- Tabela similar à de pacientes
- Modal para adicionar novo cliente
- Formulário funcional com validação
- Filtros e busca

#### 4. Cadastro de Pacientes (`patient-registration-static.html`)
- Formulário multi-step completo
- Upload de foto (simulado)
- Validação de campos obrigatórios
- Máscaras para CPF, telefone, CEP
- Indicador de progresso
- Review final dos dados

#### 5. Página 404 (`not-found-static.html`)
- Design consistente com o resto da aplicação
- Link de volta para o início

## Recursos CSS

### Sistema de Design
```css
/* Cores principais definidas por variáveis */
:root {
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96%;
  --accent: 210 40% 96%;
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  /* ... mais cores */
}
```

### Componentes Principais
- **Buttons:** `.btn`, `.btn-primary`, `.btn-outline`
- **Cards:** `.card`, `.card-header`, `.card-content`
- **Inputs:** `.input` com estados de foco e validação
- **Tables:** `.table` com hover effects
- **Modals:** `.modal` com backdrop blur
- **Badges:** `.badge`, `.badge-secondary`, `.badge-outline`

### Responsividade
- Mobile-first approach
- Breakpoints em 768px (md) e 1024px (lg)
- Grid system flexível
- Tipografia responsiva

## Recursos JavaScript

### Classes Utilitárias
- `FormUtils` - Validação e máscaras
- `SearchFilter` - Busca e filtros
- `Toast` - Notificações
- `Modal` - Gerenciamento de modais

### Funcionalidades
```javascript
// Validação de CPF
FormUtils.validateCPF(cpf)

// Máscaras automáticas
FormUtils.maskPhone(input)
FormUtils.maskCPF(input)

// Notificações
Toast.success('Sucesso!')
Toast.error('Erro!')

// Modais
Modal.open('modalId')
Modal.close('modalId')
```

## Personalização

### Cores
Edite as variáveis CSS em `main.css` na seção `:root`:
```css
:root {
  --primary: 222.2 47.4% 11.2%; /* Sua cor primária */
  --secondary: 210 40% 96%;       /* Sua cor secundária */
  /* ... */
}
```

### Componentes
Todos os componentes são modulares e podem ser facilmente modificados através das classes CSS correspondentes.

### JavaScript
As funcionalidades JavaScript são organizadas em classes e podem ser estendidas ou modificadas conforme necessário.

## Compatibilidade

- **Navegadores modernos:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile:** Totalmente responsivo
- **Acessibilidade:** Focusable elements, semantic HTML
- **Performance:** CSS puro, JavaScript vanilla otimizado

## Próximos Passos

Para usar em produção:
1. Minimize os arquivos CSS e JS
2. Otimize as imagens
3. Configure headers de cache apropriados
4. Implemente analytics se necessário
5. Teste em diferentes dispositivos e navegadores

## Estrutura de Arquivos Recomendada

```
projeto/
├── index-static.html
├── patients-static.html
├── clients-static.html
├── patient-registration-static.html
├── not-found-static.html
├── main.css
├── patient-registration.css
├── main.js
├── patient-registration.js
└── README_STATIC_HTML.md
```

Este projeto está pronto para ser hospedado em qualquer servidor web estático ou CDN.