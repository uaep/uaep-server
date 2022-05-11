## Description

---

Ajou University 2022-1 Media Project

The Backend of <span style="color:orange">**UAEP**</span>

구현하고자 하는 기능

- <span style="color:gray">~~email 인증을 통한 회원가입~~</spqn>
- JWT : Access token, Refresh token 인증을 통한 로그인 <span style="color:orange">-> 진행 중</span>
- 프로필 수정
- 방 생성 및 접속
- 실시간 채팅(미확정)
- 매 경기마다 진행되는 상대방 평가 및 레벨링 시스템

<!-- [Nest](https://github.com/nestjs/nest) framework TypeScript starter repository. -->

## Requirements

---

- nodeJs : v14.17.6

- mariaDB : v10.6.7

## Installation

---

```bash
$ npm install
```

## Running the app

---

```bash
# development(watch mode)
$ npm run start:dev

# production mode
$ npm run start
```

watch mode로 실행하기 전에,

<span style="color:red">**반드시**</span> < .env.development.local >라는 이름의 파일을 만들고 아래 변수들을 저장할 것 (env 파일 이름 변경 절대 <span style="color:red">**X**</span> !!!)

- BASE_URL : 사용할 URL(ex.http://localhost:3000)
- PORT : 사용 할 포트 번호
- DB_HOST : 사용할 DB의 host, dev에서는 localhost
- DB_PORT : 사용할 DB의 port number
- DB_USERNAME : 사용할 DB의 username, 따로 설정하지 않았다면 root가 기본
- DB_PASSWORD : 사용할 DB의 password
- DB_NAME : 사용할 DB의 이름
- EMAIL_USER : 회원가입 시 인증코드를 보내주는 계정의 이메일
- EMAIL_PASS : 회원가입 시 인증코드를 보내주는 계정의 비밀번호
- ACCESS_TOKEN_SECRET_KEY : Access token의 secret key
- ACCESS_TOKEN_EXPIRATION_TIME : Access token의 유효기간(단위 : s)
- REFRESH_TOKEN_SECRET_KEY : Refresh token의 secret key
- REFRESH_TOKEN_EXPIRATION_TIME : Refresh token의 유효기간(단위 : s)

> (Gmail 기준) EMAIL_USER에 사용할 계정은
>
> > 계정 -> 보안 -> '보안 수준이 낮은 앱의 액세스'를 허용으로 변경해야 메일 전송이 가능

<br>

++**<span style="color:red">주의!</span>** **dev(watch mode)에서는 DB가 매번 초기화 됨**

## API

---

> POST /users/email_validity_checks

- 실시간 이메일 중복 및 도메인 유효성 체크

  - 실패 시 response

    ```
    - 유효하지 않은 도메인일 경우
    {
        "statusCode": 422,
        "message": "Unvalid Email Domain : error.com.",
        "error": "Unprocessable Entity"
    }

    - 중복된 이메일(이미 사용중인 경우)
    {
        "statusCode": 422,
        "message": "This email is already taken.",
        "error": "Unprocessable Entity"
    }
    ```

  - 성공 시 response

    ```
    - 따로 설정하지 않아도 response JSON object의 url로 Redirect됨

    {
        url: 'http://localhost:3000/users/email_verify?signupVerifyToken=${signupVerifyToken}',
    }
    ```

> POST /users/email_verify?signupVerifyToken=${signupVerifyToken}

- 인증코드 확인

  - 실패 시 response
    ```
    - 유효하지 않은 인증코드인 경우
    {
        "statusCode": 400,
        "message": "This code is not valid.",
        "error": "Bad Request"
    }
    ```
  - 성공 시 response

    ```
    - 따로 설정하지 않아도 response JSON object의 url로 Redirect됨

    {
        url: 'http://localhost:3000/users?signupVerifyToken=${signupVerifyToken}',
    }
    ```

> POST /users?signupVerifyToken=${signupVerifyToken}

- 회원가입(이메일을 제외한 나머지 정보)

  - 실패 시 response

    ```
    - 입력하지 않은 정보(ex.name)가 있는 경우
    {
        "statusCode": 400,
        "message": [
            "name must be a string"
        ],
        "error": "Bad Request"
    }

    - 비밀번호와 비밀번호 확인이 일치하지 않는 경우
    {
        "statusCode": 400,
        "message": "Password confirmation does not match",
        "error": "Bad Request"
    }
    ```

  - 성공 시 response

    ```
    - 따로 설정하지 않아도 response JSON object의 url로 Redirect됨

    {
        url: 'http://localhost:3000/users/auth/login',
    }
    ```

> POST /users/auth/login

- 로그인

  - 실패 시 response

    ```
    - 존재하지 않는 계정 or 비밀번호 틀린 경우
    {
        "statusCode": 400,
        "message": "Incorrect email or password.",
        "error": "Bad Request"
    }
    ```

  - 성공 시 response

    ```
    - 따로 설정하지 않아도 response JSON object의 url로 Redirect됨

    {
        url: 'http://localhost:3000/main(미정)',
    }


    -> 성공시 Response의 cookies에 access_token, refresh_token 생성
    ```

> **로그인 이후 공통 Response**

```
  - Access token이나 Refresh token이 request의 cookie에 없을 경우
  {
      "statusCode": 401,
      "message": "Access or Refresh token not sent",
      "error": "Unauthorized"
  }

  - Access token이나 Refresh token이 유효하지 않은 경우
  {
      "statusCode": 401,
      "message": "Invalid access or refresh token",
      "error": "Unauthorized"
  }

  - Access token이나 Refresh token이 만료된 경우
  {
      "statusCode": 401,
      "message": "Expired access or refresh token",
      "error": "Unauthorized"
  }
```

> POST /users/auth/logout

- 로그아웃

  - 성공 시 response

    ```
    - 따로 설정하지 않아도 response JSON object의 url로 Redirect됨

    {
        url: 'http://localhost:3000/users/auth/login',
    }
    ```

> GET /users

- 프로필 조회

  - 성공 시 response

    ```
    {
        "email": "example@email.com",
        "name": "Name",
        "gender": "male",
        "address": "address",
        "position": "FW"
    }
    ```

## Test

---

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```
