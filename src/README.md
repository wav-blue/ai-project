## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

📦src
┣ 📂config
┃ ┣ 📜app.config.ts
┃ ┣ 📜mongo.config.ts
┃ ┣ 📜ocr.config.ts
┃ ┣ 📜openai.config.ts
┃ ┣ 📜portone.config.ts
┃ ┣ 📜rds.config.ts
┃ ┗ 📜s3.config.ts
┣ 📂modules
┃ ┣ 📂chat
┃ ┃ ┣ 📂controllers
┃ ┃ ┃ ┗ 📜chat.controller.ts
┃ ┃ ┣ 📂dtos
┃ ┃ ┃ ┗ 📜chat.dto.ts
┃ ┃ ┣ 📂entities
┃ ┃ ┃ ┗ 📜chat.entity.ts
┃ ┃ ┣ 📂repositories
┃ ┃ ┃ ┗ 📜chat.repository.ts
┃ ┃ ┣ 📂services
┃ ┃ ┃ ┗ 📜chat.service.ts
┃ ┃ ┗ 📜chat.module.ts
┃ ┣ 📂community
┃ ┃ ┣ 📂controllers
┃ ┃ ┃ ┗ 📜community.controller.ts
┃ ┃ ┣ 📂dtos
┃ ┃ ┃ ┣ 📜post.dto.ts
┃ ┃ ┃ ┗ 📜reply.dto.ts
┃ ┃ ┣ 📂entities
┃ ┃ ┃ ┣ 📜post.entity.ts
┃ ┃ ┃ ┗ 📜reply.entity.ts
┃ ┃ ┣ 📂repositories
┃ ┃ ┃ ┣ 📜post.repository.ts
┃ ┃ ┃ ┗ 📜reply.repository.ts
┃ ┃ ┣ 📂services
┃ ┃ ┃ ┗ 📜community.service.ts
┃ ┃ ┗ 📜community.module.ts
┃ ┣ 📂order
┃ ┃ ┣ 📂controllers
┃ ┃ ┃ ┗ 📜order.controller.ts
┃ ┃ ┣ 📂dtos
┃ ┃ ┃ ┗ 📜order.dto.ts
┃ ┃ ┣ 📂entities
┃ ┃ ┃ ┗ 📜order.entity.ts
┃ ┃ ┣ 📂repositories
┃ ┃ ┃ ┗ 📜order.repository.ts
┃ ┃ ┣ 📂services
┃ ┃ ┃ ┗ 📜order.service.ts
┃ ┃ ┗ 📜order.module.ts
┃ ┗ 📂user
┃ ┃ ┣ 📂controllers
┃ ┃ ┃ ┗ 📜user.controller.ts
┃ ┃ ┣ 📂dtos
┃ ┃ ┃ ┗ 📜user.dto.ts
┃ ┃ ┣ 📂entities
┃ ┃ ┃ ┗ 📜user.entity.ts
┃ ┃ ┣ 📂repositories
┃ ┃ ┃ ┗ 📜user.repository.ts
┃ ┃ ┣ 📂services
┃ ┃ ┃ ┗ 📜user.service.ts
┃ ┃ ┗ 📜user.module.ts
┣ 📜app.module.ts
┗ 📜main.ts
