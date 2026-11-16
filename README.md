# Treino Forte

Aplicativo web/PWA para registrar musculação. Os dados ficam no `localStorage` do navegador; não há conta, servidor ou sincronização automática.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub, por exemplo `treino-forte`.
2. Extraia todos os arquivos desta pasta ZIP.
3. Envie `index.html`, `styles.css`, `app.js`, `manifest.webmanifest`, `sw.js` e `icon.svg` para a raiz do repositório.
4. No GitHub, abra **Settings → Pages**.
5. Em **Build and deployment**, selecione **Deploy from a branch**.
6. Escolha a branch `main` e a pasta `/ (root)`. Clique em **Save**.
7. Aguarde a publicação. O endereço será semelhante a:
   `https://SEU-USUARIO.github.io/treino-forte/`

Se o repositório for o site principal do usuário (`SEU-USUARIO.github.io`), o endereço será:
`https://SEU-USUARIO.github.io/`

## Instalar no Android

1. Abra o endereço publicado no Chrome do celular.
2. Abra o menu ⋮ do Chrome.
3. Toque em **Instalar app** ou **Adicionar à tela inicial**.
4. Abra pelo ícone criado. Depois da primeira carga, o app pode funcionar offline.

## Uso e backup

- Na aba **Início**, escolha Treino A ou B e toque em **Iniciar**.
- Informe peso e repetições em cada série. Marque ✓ ao concluir; o descanso começa automaticamente.
- Toque em **Finalizar treino** para salvar no histórico.
- Em **Editar ficha**, altere treinos e exercícios.
- Em **Configurações**, exporte backups JSON regularmente. Para migrar de aparelho, exporte no antigo e importe no novo.

## Importante sobre armazenamento

Os dados ficam no armazenamento local do navegador (localStorage), vinculados ao navegador e à origem do site. Não são enviados ao GitHub. Limpar os dados do site/navegador, usar outro navegador ou mudar o domínio pode fazer os registros parecerem ausentes. Faça backups periódicos. O app não sincroniza automaticamente entre dispositivos.

## Atualizar o aplicativo

Substitua os arquivos no repositório e faça commit. O service worker usa cache offline; após uma atualização publicada, feche e reabra o app ou recarregue a página com internet para receber a versão nova.

## Privacidade

O projeto não inclui analytics, publicidade, login ou chamadas a serviços externos.
