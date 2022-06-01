## Description

---

Ajou University 2022-1 Media Project

The Backend of <span style="color:orange">**UAEP**</span>

구현하고자 하는 기능

- <span style="color:gray">~~email 인증을 통한 회원가입~~</span>
- <span style="color:gray">~~JWT : Access token, Refresh token 인증을 통한 로그인~~</span>
- <span style="color:gray">~~프로필 수정~~</span>
- <span style="color:gray">~~방 생성 및 접속~~</span>
- 방 리스트 필터링 <span style="color:orange">-> 진행 중</span>
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
- POSITION_CHANGE_POINT : 일단은 10으로 설정(추후 변경 가능)

> (Gmail 기준) EMAIL_USER에 사용할 계정은
>
> > 계정 -> 보안 -> '보안 수준이 낮은 앱의 액세스'를 허용으로 변경해야 메일 전송이 가능

<br>

++**<span style="color:red">주의!</span>** **dev(watch mode)에서는 DB가 매번 초기화 됨**

## API

---

- POST /users/email_validity_checks

  > 실시간 이메일 중복 및 도메인 유효성 체크
  >
  > - 실패 시 response
  >
  >   ```
  >   - 유효하지 않은 도메인일 경우
  >   {
  >       "statusCode": 422,
  >       "message": "Unvalid Email Domain : error.com.",
  >       "error": "Unprocessable Entity"
  >   }
  >
  >   - 중복된 이메일(이미 사용중인 경우)
  >   {
  >       "statusCode": 422,
  >       "message": "This email is already taken.",
  >       "error": "Unprocessable Entity"
  >   }
  >   ```
  >
  > - 성공 시 response
  >
  >   ```
  >   - 따로 설정하지 않아도 response JSON object의 url로 Redirect됨
  >
  >   {
  >       url: 'http://localhost:3000/users/email_verify?signupVerifyToken=${signupVerifyToken}',
  >   }
  >   ```

- POST /users/email_verify?signupVerifyToken=${signupVerifyToken}

  > 인증코드 확인
  >
  > - 실패 시 response
  >   ```
  >   - 유효하지 않은 인증코드인 경우
  >   {
  >       "statusCode": 400,
  >       "message": "This code is not valid.",
  >       "error": "Bad Request"
  >   }
  >   ```
  > - 성공 시 response
  >
  >   ```
  >   - 따로 설정하지 않아도 response JSON object의 url로 Redirect됨
  >
  >   {
  >       url: 'http://localhost:3000/users?signupVerifyToken=${signupVerifyToken}',
  >   }
  >   ```

- POST /users?signupVerifyToken=${signupVerifyToken}

  > 회원가입(이메일을 제외한 나머지 정보)
  >
  > - 실패 시 response
  >
  >   ```
  >   - 입력하지 않은 정보(ex.name)가 있는 경우
  >   {
  >       "statusCode": 400,
  >       "message": [
  >           "name must be a string"
  >       ],
  >       "error": "Bad Request"
  >   }
  >
  >   - 비밀번호와 비밀번호 확인이 일치하지 않는 경우
  >   {
  >       "statusCode": 400,
  >       "message": "Password confirmation does not match",
  >       "error": "Bad Request"
  >   }
  >   ```
  >
  > - 성공 시 response
  >
  >   ```
  >   - 따로 설정하지 않아도 response JSON object의 url로 Redirect됨
  >
  >   {
  >       url: 'http://localhost:3000/users/auth/login',
  >   }
  >   ```

- POST /users/auth/login

  > 로그인
  >
  > - 실패 시 response
  >
  >   ```
  >   - 존재하지 않는 계정 or 비밀번호 틀린 경우
  >   {
  >       "statusCode": 400,
  >       "message": "Incorrect email or password.",
  >       "error": "Bad Request"
  >   }
  >   ```
  >
  > - 성공 시 response
  >
  >   ```
  >   - 따로 설정하지 않아도 response JSON object의 url로 Redirect됨
  >
  >   {
  >       url: 'http://localhost:3000/main(미정)',
  >   }
  >
  >
  >   -> 성공시 Response의 cookies에 access_token, refresh_token 생성
  >   ```

- **로그인 이후 공통 Response**

  > ```
  >  - Access token이나 Refresh token이 request의 cookie에 없을 경우
  >  {
  >      "statusCode": 401,
  >      "message": "Access or Refresh token not sent",
  >      "error": "Unauthorized"
  >  }
  >
  >  - Access token이나 Refresh token이 유효하지 않은 경우
  >  {
  >      "statusCode": 401,
  >      "message": "Invalid access or refresh token",
  >      "error": "Unauthorized"
  >  }
  >
  >  - Access token이나 Refresh token이 만료된 경우
  >  {
  >      "statusCode": 401,
  >      "message": "Expired access or refresh token",
  >      "error": "Unauthorized"
  >  }
  > ```

- POST /users/auth/logout

  > 로그아웃
  >
  > - 성공 시 response
  >
  >   ```
  >   - 따로 설정하지 않아도 response JSON object의 url로 Redirect됨
  >
  >   {
  >       url: 'http://localhost:3000/users/auth/login',
  >   }
  >   ```

- GET /users/auth/refresh

  > refresh token 재발급
  >
  > - request의 cookies에 만료된 access_token과 refresh_token를 넣어서 요청
  >
  > - 성공 시 response의 cookies에 새로운 access_token 생성

- GET /users

  > 프로필 조회
  >
  > - 성공 시 response
  >
  >   ```
  >   {
  >       "email": "example@email.com",
  >       "name": "Name",
  >       "gender": "male",
  >       "address": "address",
  >       "position": "FW",
  >       "level_point": 0,
  >       "position_change_point": 30,
  >       "games": []
  >   }
  >   ```

- PATCH /users

  > 프로필 수정
  >
  > - Request body
  >
  >   ```
  >   name, address, position은 전부 optional
  >   {
  >       "name" : "new-name",
  >       "address" : "new-address",
  >       "position" : "new-position"
  >   }
  >   ```
  >
  > - 성공 시 response
  >
  >   ```
  >   {
  >       "url": "http://localhost:3000/users"
  >   }
  >   ```
  >
  > - 실패 시 response
  >
  >   ```
  >   - 중복된 name이 이미 존재하는 경우
  >   {
  >       "statusCode": 422,
  >       "message": "This name is already taken.",
  >       "error": "Unprocessable Entity"
  >   }
  >
  >   - 참가 중(게임에서 포지션을 선택한 경우)인 게임이 있을 경우 포지션 변경 불가
  >   {
  >       "statusCode": 405,
  >       "message": "Precondition : Deselect positions in all participating games",
  >       "error": "Method Not Allowed"
  >   }
  >
  >   - 포지션 변경 포인트가 모자란 경우
  >   {
  >       "statusCode": 400,
  >       "message": "Not enough points : 0",
  >       "error": "Bad Request"
  >   }
  >   ```

- GET /games

  > 게임 방 전체 리스트
  >
  > - 성공 시 response
  >
  >   ```
  >   [
  >       {
  >           "id": 1,
  >           "date": "2022-05-20T18:50:00.000Z",
  >           "place": "수원종합운동장",
  >           "number_of_users": "6v6",
  >           "gender": "male",
  >           "host": "방 만든 사람"
  >       },
  >       {
  >           "id": 2,
  >           "date": "2022-05-20T20:30:00.000Z",
  >           "place": "아주대학교 운동장",
  >           "number_of_users": "5v5",
  >           "gender": "any",
  >           "host": "방 만든 사람"
  >       }
  >   ]
  >   ```

- POST /games

  > 게임 방 생성
  >
  > - Request body
  >
  >   ```
  >   {
  >       "year" : 2022,
  >       "month" : 5,
  >       "day" : 31,
  >       "hour" : 18,
  >       "minute" : 50,
  >       "place" : "수원종합운동장",
  >       "number_of_users" : "6v6",
  >       "gender" : "any"
  >   }
  >   ```
  >
  > - 성공 시 response
  >
  >   ```
  >   {
  >       "url": "http://localhost:3000/games/${gameId}"
  >   }
  >   ```
  >
  > - 실패 시 response
  >
  >   ```
  >   - dto가 없거나 일치하지 않는 경우
  >   {
  >       "statusCode": 400,
  >       "message": [
  >           "year should not be empty",
  >           "year must be a number conforming to the specified constraints",
  >           "month should not be empty",
  >           "month must be a number conforming to the specified constraints",
  >           "day should not be empty",
  >           "day must be a number conforming to the specified constraints",
  >           "hour should not be empty",
  >           "hour must be a number conforming to the specified constraints",
  >           "minute should not be empty",
  >           "minute must be a number conforming to the specified constraints",
  >           "place should not be empty",
  >           "place must be a string",
  >           "number_of_users should not be empty",
  >           "number_of_users must be a valid enum value",
  >           "gender should not be empty",
  >           "gender must be a valid enum value"
  >       ],
  >       "error": "Bad Request"
  >   }
  >
  >   - 본인이 해당하지 않는 성별 전용 방을 만들 경우(ex. male인데 female 방을 만드는 경우)
  >   {
  >       "statusCode": 403,
  >       "message": "You can't create a game for ${game.gender}",
  >       "error": "Forbidden"
  >   }
  >   ```

- GET /games/:id

  > 게임 방 입장(단순 입장, 참가 X)
  >
  > - 성공 시 response
  >
  >   ```
  >   {
  >       "id": 1,
  >       "date": "2022-05-20T18:50:00.000Z",
  >       "place": "수원종합운동장2",
  >       "number_of_users": "6v6",
  >       "gender": "male",
  >       "host": "방 만든 사람",
  >       "teamA": null,
  >       "teamB": null
  >   }
  >   ```
  >
  > - 실패 시 response
  >
  >   ```
  >   - 본인이 해당하지 않는 성별 전용 방에 입장하려는 경우
  >   {
  >       "statusCode": 403,
  >       "message": "You can't enter the game : only for ${game.gender}",
  >       "error": "Forbidden"
  >   }
  >   ```

- PATCH /games/:id/:teamType

  > id에 해당하는 게임 방에서 teamType(A or B)의 포메이션 설정
  > => 포메이션을 설정하면 그 팀의 주장으로 임명됨
  >
  > - Request body
  >
  >   ```
  >   {
  >       "formation": "F212" | "F221" | "F131"
  >   }
  >   ```
  >
  > - 성공 시 response
  >
  >   ```
  >   {
  >       "id": 1,
  >       "date": "2022-05-20T18:50:00.000Z",
  >       "place": "수원종합운동장",
  >       "number_of_users": "6v6",
  >       "gender": "male",
  >       "host": "방 만든 사람",
  >       "teamA": {
  >           "FW1": null,
  >           "FW2": null,
  >           "MF": null,
  >           "DF1": null,
  >           "DF2": null,
  >           "GK": null,
  >           "CAPTAIN": {
  >               "email": "test@gmail.com",
  >               "name": "주장 A",
  >               "gender": "male",
  >               "address": "address",
  >               "position": "FW",
  >               "level_point": 0
  >           }
  >       },
  >       "teamB": null
  >   }
  >   ```
  >
  > - 실패 시 response
  >
  >   ```
  >   - A팀의 주장이 B팀의 포메이션을 변경하려고 하는 경우
  >   {
  >       "statusCode": 405,
  >       "message": "Can't select teamB's formation : You are captain of teamA",
  >       "error": "Method Not Allowed"
  >   }
  >
  >   - A팀의 팀원이 B팀의 포메이션을 변경하려고(B팀의 주장이 되려고) 하는 경우 => A팀에서 나와야만 B팀의 주장이 될 수 있다.
  >   {
  >       "statusCode": 405,
  >       "message": "Can't select teamB's formation : You already belong to teamA",
  >       "error": "Method Not Allowed"
  >   }
  >
  >   - A팀의 주장이 아닌 데 포메이션을 변경하려는 경우 => 포메이션 변경 권한은 주장에게만 있음
  >   {
  >       "statusCode": 403,
  >       "message": "Authority Required : Captain of teamA",
  >       "error": "Forbidden"
  >   }
  >
  >   - A팀에 참가 중인 팀원이 있는 경우 포메이션 변경 불가 => 포메이션 변경은 해당 팀에 참가 중인 팀원이 없을 때만 가능
  >   {
  >       "statusCode": 405,
  >       "message": "Can't change teamA's formation",
  >       "error": "Method Not Allowed"
  >   }
  >
  >   - 지원하지 않는 포메이션인 경우 (현재 지원하는 포메이션은 F221, F212, F131)
  >   {
  >       "statusCode": 404,
  >       "message": "F311 is an unsupported formation",
  >       "error": "Not Found"
  >   }
  >   ```

- PATCH /games/:id/:teamType/:position

  > id에 해당하는 게임 방에서 teamType(A or B)의 포메이션 내에서 원하는 position 선택
  >
  > - 성공 시 response
  >
  >   ```
  >   {
  >       "id": 1,
  >       "date": "2022-05-20T18:50:00.000Z",
  >       "place": "수원종합운동장",
  >       "number_of_users": "6v6",
  >       "gender": "male",
  >       "host": "방 만든 사람",
  >       "teamA": {
  >           "FW1": {
  >               "email": "test@gmail.com",
  >               "name": "name",
  >               "gender": "male",
  >               "address": "address",
  >               "position": "FW",
  >               "level_point": 0
  >           }
  >           "FW2": null,
  >           "MF": null,
  >           "DF1": null,
  >           "DF2": null,
  >           "GK": null,
  >           "CAPTAIN": {
  >               "email": "test@gmail.com",
  >               "name": "주장 A",
  >               "gender": "male",
  >               "address": "address",
  >               "position": "FW",
  >               "level_point": 0
  >           }
  >       },
  >       "teamB": null
  >   }
  >   ```
  >
  > - 실패 시 response
  >
  >   ```
  >   - 아직 포메이션이 지정되지 않은 팀의 포지션을 요청한 경우
  >   {
  >       "statusCode": 404,
  >       "message": "teamA doesn't have formation yet",
  >       "error": "Not Found"
  >   }
  >
  >   - 유효하지 않은 포지션을 요청한 경우
  >   {
  >       "statusCode": 404,
  >       "message": "Invalid Position : abcde",
  >       "error": "Not Found"
  >   }
  >
  >   - 자신의 포지션이 아닌 포지션을 요청한 경우
  >   {
  >       "statusCode": 403,
  >       "message": "Your position is FW, but you choose MF",
  >       "error": "Forbidden"
  >   }
  >
  >   - A 또는 B팀에 이미 참가 중인 팀원이 다른 포지션을 요청한 경우
  >   {
  >       "statusCode": 409,
  >       "message": "You already select teamA : FW1",
  >       "error": "Conflict"
  >   }
  >   ```

- PATCH /games/:id/:teamType/captain

  > 주장을 다른 팀원에게 양도
  >
  > - Request body
  >
  >   ```
  >   {
  >       "name": "주장을 넘겨주고 싶은 팀원의 name"
  >   }
  >   ```
  >
  > - 실패 시 response
  >
  >   ```
  >   - 자신이 팀의 주장이 아닐 경우
  >   {
  >       "statusCode": 403,
  >       "message": "Authority Required : Captain of teamA",
  >       "error": "Forbidden"
  >   }
  >
  >   - 잘못된 or 존재하지 않는 팀원의 name으로 요청한 경우
  >   {
  >       "statusCode": 404,
  >       "message": "There is no user named XXX on teamA",
  >       "error": "Not Found"
  >   }
  >   ```

- DELETE /games/:id/:teamType

  > 게임이 끝난 경우(방을 만들 때 정해진 게임 시간을 기준으로 게임이 끝난지를 판단)
  > => 주장이 게임 종료를 요청한 팀의 팀원들만 리뷰를 진행할 수 있음
  >
  > - 실패 시 response
  >
  >   ```
  >   - 자신이 팀의 주장이 아닌데 게임 종료를 요청한 경우
  >   {
  >       "statusCode": 403,
  >       "message": "Authority Required : Captain of teamA",
  >       "error": "Forbidden"
  >   }
  >
  >   - 현재 시간이 게임 시간을 지나지 않았는데(게임이 끝나지 않았는데) 게임 종료를 요청한 경우
  >   {
  >       "statusCode": 403,
  >       "message": "The game is not over",
  >       "error": "Forbidden"
  >   }
  >   ```

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
