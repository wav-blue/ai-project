# 💘연애 현자 구루

## 주제

<p style="font-size: 15px;"> ❝더 이상 친구에게 연애 상담은 그만! 똑똑한 연애 AI가 당신의 연애 고민에 답을 내려드립니다.❞ </p>

OpenAI 서비스를 이용한 인간성이 느껴지는 답변으로 연애의 시작, 혹은 지속에 도움을 주는 서비스입니다.<br/>관련 데이터를 학습한 긍정/부정 모델으로 텍스트를 분석하고 활용하여 사용자의 경험을 개선합니다.

> 프로젝트 기간 : 2024-01-01 ~ 2024-02-03

## 기술 스택

#### 공통

<img src="https://img.shields.io/badge/npm-CB3837?style=for-the-badge&logo=npm&logoColor=white]"/> <img src="https://img.shields.io/badge/Typescript-3178C6?style=for-the-badge&logo=Typescript&logoColor=white]"/>

#### AI

<img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=OpenAI&logoColor=white]"/> <img src="https://img.shields.io/badge/tensorflow-FF6F00?style=for-the-badge&logo=tensorflow&logoColor=white]"/> <img src="https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=Flask&logoColor=white]"/> 

#### FRONT

1. 프레임워크

   <img src="https://img.shields.io/badge/react-61DAFB?style=for-the-badge&logo=react&logoColor=white]"/> <img src="https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=Next.js&logoColor=white]"/>

2. 전역상태관리

   <img src="https://img.shields.io/badge/Redux-CC6699?style=for-the-badge&logo=Redux&logoColor=white]"/>

3. 스타일링

   <img src="https://img.shields.io/badge/Tailwind CSS-06B6D4?style=for-the-badge&logo=TailwindCSS&logoColor=white]"/>

- Presigned-Url(S3)
- React-query, React-Quill 라이브러리 활용

#### BACK

1. 서버 구축

   <img src="https://img.shields.io/badge/node.js-339933?style=for-the-badge&&logo=node.js&logoColor=white"/> <img src="https://img.shields.io/badge/nestjs-E0234E?style=for-the-badge&logo=nestjs&logoColor=white]"/>

2. 데이터베이스

   <img src="https://img.shields.io/badge/MySQL-5294E2?style=for-the-badge&logo=MySQL&logoColor=white]"/> <img src="https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=MySQL&logoColor=white]"/> <img src="https://img.shields.io/badge/Amazon RDS-527FFF?style=for-the-badge&logo=Amazon RDS&logoColor=white]"/> <img src="https://img.shields.io/badge/Amazon S3-569A31?style=for-the-badge&logo=Amazon S3&logoColor=white]"/>

#### 사용한 모델 및 데이터셋

- 모델: https://huggingface.co/bert-base-multilingual-cased
- 데이터셋: https://github.com/songys/Chatbot_data/tree/master

## 팀원 소개

| 팀원   | 포지션              |
| ------ | :------------------ |
| 김진영 | 팀장/프론트/AI(gpt) |
| 전성혜 | 프론트              |
| 조영민 | 프론트              |
| 김혜연 | 백엔드/AI(gpt)      |
| 박수진 | 백엔드/AI(model)    |
| 최원민 | 백엔드              |

<br/>

## 주요 기능

#### OpenAI를 이용한 고민 상담

- 상황 문답을 통해 유저 상황을 입력
- 텍스트 감정 분석으로 유저의 감정 파악
- OpenAI를 이용해 답변 생성 및 출력

#### 회원 기능

- id, password를 입력하여 회원가입
- 소셜 로그인 (자동 회원가입)
- 소셜 로그인한 회원의 연동 기능 - 이메일, 비밀번호 설정
- 작성한 게시물, 댓글 모아보기

#### 커뮤니티 게시판

- 게시글 목록 조회
- 게시글의 상세 조회 및 작성, 수정, 삭제 기능
- 댓글 작성 및 삭제
- 긍/부정 분석한 댓글의 성향 표시

#### 결제 시스템

- API를 이용한 결제 서비스 구현
- 결제 후 서비스 추가 이용 가능

#### 신고

- 게시글, 댓글 신고 기능
- 신고 건수에 따라 게시글, 댓글 자동 삭제
