## Description

---

Ajou University 2022-1 Media Project

The Backend of <span style="color:orange">**UAEP**</span>

구현하고자 하는 기능

- <span style="color:gray">~~email 인증을 통한 회원가입~~</span>
- <span style="color:gray">~~JWT : Access token, Refresh token 인증을 통한 로그인~~</span>
- <span style="color:gray">~~프로필 수정~~</span>
- <span style="color:gray">~~방 생성 및 접속~~</span>
- <span style="color:gray">~~방 리스트 필터링~~</span>
- <span style="color:gray">~~매 경기마다 진행되는 상대방 평가 및 레벨링 시스템~~</span>
- 게임 추천(자동매칭) <span style="color:orange">-> 진행 중</span>

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
  > - Request body
  >
  >   ```
  >   {
  >       "name":"example",
  >       "password": "example_password",
  >       "password_check": "example_password",
  >       "gender": "male",
  >       "province":"경기도",
  >       "town":"수원시",
  >       "position": "FW",
  >       "level": "아마추어"
  >   }
  >   ```
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
  >
  >   - 유효하지 않은 레벨을 요청한 경우
  >   {
  >       "statusCode": 400,
  >       "message": "${level} is not exist",
  >       "error": "Bad Request"
  >   }
  >
  >   - province에 해당하지 않는 town을 선택한 경우
  >   {
  >       "statusCode": 400,
  >       "message": "The address ${province} ${town} is invalid format.",
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
  >       "gender": "남성",
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
  >   name, province, town, position은 전부 optional
  >   {
  >       "name" : "new-name",
  >       "province" : "new-province",
  >       "town" : "new-town",
  >       "position" : "new-position"
  >   }
  >   ```
  >
  > - 성공 시 response
  >
  >   ```
  >   {
  >       "email": "example@email.com",
  >       "name": "Name",
  >       "gender": "남성",
  >       "province" : "new-province",
  >       "town" : "new-town",
  >       "position": "FW",
  >       "level_point": 0,
  >       "position_change_point": 30,
  >       "games": []
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
  >
  >   - province만 선택하고 town은 선택하지 않은 경우
  >   {
  >       "statusCode": 400,
  >       "message": "No detailed region selected.",
  >       "error": "Bad Request"
  >   }
  >
  >   - province에 해당하지 않는 town을 선택한 경우
  >   {
  >       "statusCode": 400,
  >       "message": "The address ${province} ${town} is invalid format.",
  >       "error": "Bad Request"
  >   }
  >   ```

- GET /games

  > 게임 방 전체 리스트
  >
  > - Query parameters for filtering
  >
  >   - month
  >     - 1 ~ 12
  >     - default = 현재 월(ex. 오늘이 6/3일 경우 month = 6)
  >   - day
  >     - 1 ~ (30|31)
  >     - default = 현재 일(ex. 오늘이 6/3일 경우 day = 3)
  >   - gender
  >     - 남성, 여성, 성별 무관
  >   - status
  >     - 참가 가능, 마감
  >   - number_of_users
  >     - 6v6, 5v5
  >   - region
  >     - 서울, 경기/강원, 인천, 대전/세종/충청, 대구/경북, 부산/울산/경남, 광주/전라, 제주
  >
  > - ex) /games?month=6&day=3&gender=남성&status=참가 가능&number_of_users=6v6&region=경기/강원
  >
  > - 성공 시 response
  >
  >   ```
  >   [
  >       {
  >           "id": 1,
  >           "uuid": "7a925351-e7a3-40f3-9b47-77fd05b624fb",
  >           "date": "2022-05-20T18:50:00.000Z",
  >           "province": "경기도",
  >           "town": "수원시",
  >           "place": "수원종합운동장",
  >           "number_of_users": "6v6",
  >           "gender": "남성",
  >           "host": "방 만든 사람"
  >       },
  >       {
  >           "id": 2,
  >           "uuid": "4c97a3ef-51ce-4b9a-a4fa-1f6df5fda287",
  >           "date": "2022-05-20T20:30:00.000Z",
  >           "province": "경기도",
  >           "town": "수원시",
  >           "place": "아주대학교 운동장",
  >           "number_of_users": "5v5",
  >           "gender": "성별 무관",
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
  >       "gender" : "성별 무관"
  >   }
  >   ```
  >
  > - 성공 시 response
  >
  >   ```
  >   {
  >       "url": "http://localhost:3000/games/${game-uuid}"
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
  >
  >   - 레벨이 세미프로 미만인데 5v5 게임을 만드려는 경우
  >   {
  >       "statusCode": 403,
  >       "message": "5vs5 game can only be created by users with ${LEVEL.SP1} level or higher.",
  >       "error": "Forbidden"
  >   }
  >
  >   - 5v5 게임을 선택했는데, level_limit을 '세미프로1 이상'을 선택하지 않은 경우
  >   {
  >       "statusCode": 400,
  >       "message": "When you chooses 5vs5 game, level_limit must be ${LEVEL_LIMIT.HIGHER_SP1}.",
  >       "error": "Bad Request"
  >   }
  >   ```

- GET /games/:uuid

  > 게임 방 입장(단순 입장, 참가 X)
  >
  > - 성공 시 response
  >
  >   ```
  >   {
  >       "id": 1,
  >       "uuid": "7a925351-e7a3-40f3-9b47-77fd05b624fb",
  >       "date": "2022-05-20T18:50:00.000Z",
  >       "province": "경기도",
  >       "town": "수원시",
  >       "place": "수원종합운동장2",
  >       "number_of_users": "6v6",
  >       "gender": "남성",
  >       "host": "방 만든 사람",
  >       "teamA": null,
  >       "teamB": null,
  >       "status": "참가 가능",
  >       "level_limit": "모든 레벨",
  >       "level_distribution": {
  >           "스타터": 0.1666667,
  >           "비기너": 0.3333333,
  >           "아마추어": 0.5,
  >           "세미프로": 0,
  >           "프로": 0
  >       },
  >   }
  >   ```
  >
  > - 실패 시 response
  >
  >   ```
  >   - 본인이 해당하지 않는 성별 전용 방에 입장하려는 경우
  >   {
  >       "statusCode": 403,
  >       "message": "You can't enter this game : only for ${game.gender}",
  >       "error": "Forbidden"
  >   }
  >
  >   - 본인의 레벨에 해당하지 않는 방을 들어가는 경우
  >   {
  >       "statusCode": 403,
  >       "message": "You can't enter this game - Level limit ${LEVEL_LIMIT.BELOW_B3}",
  >       "error": "Forbidden"
  >   }
  >   ```

- PATCH /games/:uuid/:teamType

  > id에 해당하는 게임 방에서 teamType(A or B)의 포메이션 설정
  > => 포메이션을 설정하면 그 팀의 주장으로 임명됨
  >
  > - Request body
  >
  >   ```
  >   {
  >       "formation": "F212" | "F221" | "F131" | "F202" | "F211" | "F121" | "F112"
  >   }
  >   ```
  >
  > - 성공 시 response
  >
  >   ```
  >   {
  >       "id": 1,
  >       "uuid": "7a925351-e7a3-40f3-9b47-77fd05b624fb",
  >       "date": "2022-05-20T18:50:00.000Z",
  >       "place": "수원종합운동장",
  >       "number_of_users": "6v6",
  >       "gender": "남성",
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
  >               "gender": "남성",
  >               "address": "address",
  >               "position": "FW",
  >               "level_point": 0
  >           }
  >       },
  >       "teamB": null,
  >       "status": "참가 가능",
  >       "level_limit": "모든 레벨",
  >       "level_distribution": {
  >           "스타터": 0.1666667,
  >           "비기너": 0.3333333,
  >           "아마추어": 0.5,
  >           "세미프로": 0,
  >           "프로": 0
  >       },
  >   }
  >   ```
  >
  > - 실패 시 response
  >
  >   ```
  >   - teamType가 'A' 또는 'B'가 아닌 경우
  >   {
  >       "statusCode": 400,
  >       "message": "TeamType is invalid format : ${teamType}",
  >       "error": "Bad Request"
  >   }
  >
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

- PATCH /games/:uuid/:teamType/:position

  > id에 해당하는 게임 방에서 teamType(A or B)의 포메이션 내에서 원하는 position 선택
  >
  > - 성공 시 response
  >
  >   ```
  >   {
  >       "id": 1,
  >       "uuid": "7a925351-e7a3-40f3-9b47-77fd05b624fb",
  >       "date": "2022-05-20T18:50:00.000Z",
  >       "place": "수원종합운동장",
  >       "number_of_users": "6v6",
  >       "gender": "남성",
  >       "host": "방 만든 사람",
  >       "teamA": {
  >           "FW1": {
  >               "email": "test@gmail.com",
  >               "name": "name",
  >               "gender": "남성",
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
  >               "gender": "남성",
  >               "address": "address",
  >               "position": "FW",
  >               "level_point": 0
  >           }
  >       },
  >       "teamB": null,
  >       "status": "참가 가능",
  >       "level_limit": "모든 레벨",
  >       "level_distribution": {
  >           "스타터": 0.1666667,
  >           "비기너": 0.3333333,
  >           "아마추어": 0.5,
  >           "세미프로": 0,
  >           "프로": 0
  >       },
  >   }
  >   ```
  >
  > - 실패 시 response
  >
  >   ```
  >   - teamType가 'A' 또는 'B'가 아닌 경우
  >   {
  >       "statusCode": 400,
  >       "message": "TeamType is invalid format : ${teamType}",
  >       "error": "Bad Request"
  >   }
  >
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

- PATCH /games/:uuid/:teamType/captain

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
  >   - teamType가 'A' 또는 'B'가 아닌 경우
  >   {
  >       "statusCode": 400,
  >       "message": "TeamType is invalid format : ${teamType}",
  >       "error": "Bad Request"
  >   }
  >
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

- DELETE /games/:uuid/:teamType

  > 게임이 끝난 경우(방을 만들 때 정해진 게임 시간을 기준으로 게임이 끝난지를 판단)
  > => 주장이 게임 종료를 요청한 팀의 팀원들만 리뷰를 진행할 수 있음
  >
  > - 실패 시 response
  >
  >   ```
  >   - teamType가 'A' 또는 'B'가 아닌 경우
  >   {
  >       "statusCode": 400,
  >       "message": "TeamType is invalid format : ${teamType}",
  >       "error": "Bad Request"
  >   }
  >
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

**<참고> 현재 dev서버에서 테스트용으로 GK에 dummy data를 자동으로 생성함(src/games/games.service.ts/selectFormation#187) + 모든 포지션에 유저가 있지 않아도 게임 종료 및 리뷰가 가능함(prod에서는 변경 예정)**

- GET /reviews

  > 리뷰 리스트
  > => 주장이 게임 종료를 요청한 팀의 팀원들만 리뷰리스트에 해당 리뷰가 나타남
  >
  > - status
  >
  >   - "리뷰 쓰기" : default
  >   - "완료" : 종료시간으로부터 3일 후 게임에 참가한 인원 중 아무나 리뷰 리스트를 처음 요청한 순간 자동으로 바뀜 => Batch를 따로 만들지 않았기 때문에
  >
  > - 성공 시 response
  >
  >   ```
  >   [
  >       {
  >           "id": 1,
  >           "uuid": "7a925351-e7a3-40f3-9b47-77fd05b624fb",
  >           "date": "2022-06-05T19:22:01.000Z",
  >           "place": "수원종합운동장",
  >           "number_of_users": "6v6",
  >           "gender": "성별 무관",
  >           "host": "방 만든 사람",
  >           "teamA": {
  >               "FW1": 유저
  >               "FW2": 유저,
  >               "MF": 유저,
  >               "DF1": 유저,
  >               "DF2": 유저,
  >               "GK": 유저
  >               "CAPTAIN": 주장
  >           },
  >           "teamB": {
  >               "FW1": 유저
  >               "FW2": 유저,
  >               "MF": 유저,
  >               "DF1": 유저,
  >               "DF2": 유저,
  >               "GK": 유저
  >               "CAPTAIN": 주장
  >           },
  >           "status": "리뷰 쓰기",
  >           "teamA_status": "리뷰 쓰기",
  >           "teamB_status": "리뷰 쓰기",
  >           "apply_flag": false
  >       }
  >   ]
  >   ```

- GET /reviews/:uuid

  > 리뷰 화면
  > => 게임 상세 화면과 유사한 UI
  >
  > - 성공 시 response
  >
  >   ```
  >   {
  >       "id": 1,
  >       "uuid": "7a925351-e7a3-40f3-9b47-77fd05b624fb",
  >       "date": "2022-06-05T19:22:01.000Z",
  >       "place": "수원종합운동장",
  >       "number_of_users": "6v6",
  >       "gender": "성별 무관",
  >       "host": "방 만든 사람",
  >       "teamA": {
  >           "FW1": 유저
  >           "FW2": 유저,
  >           "MF": 유저,
  >           "DF1": 유저,
  >           "DF2": 유저,
  >           "GK": 유저
  >           "CAPTAIN": 주장
  >       },
  >       "teamB": {
  >           "FW1": 유저
  >           "FW2": 유저,
  >           "MF": 유저,
  >           "DF1": 유저,
  >           "DF2": 유저,
  >           "GK": 유저
  >           "CAPTAIN": 주장
  >       },
  >       "status": "리뷰 쓰기",
  >       "teamA_status": "리뷰 쓰기",
  >       "teamB_status": "리뷰 쓰기",
  >       "apply_flag": false
  >   }
  >   ```
  >
  > - 실패 시 response
  >
  >   ```
  >   - uuid에 해당하는 리뷰가 없는 경우
  >   {
  >       "statusCode": 404,
  >       "message": "Review ${reviewId} is not exist",
  >       "error": "Not Found"
  >   }
  >
  >   - 아직 주장이 게임 종료를 요청하지 않은 경우
  >   {
  >       "statusCode": 403,
  >       "message": "Can't review games that haven't finished yet : ${review.uuid}",
  >       "error": "Forbidden"
  >   }
  >   ```

- PATCH /reviews/:uuid/:teamType/:position

  > 해당 포지션의 유저를 리뷰
  >
  > - Request body
  >
  >   - report(선택 사항)
  >     - "게임에 참가하지 않음"
  >     - "비매너 플레이"
  >     - "본인의 포지션을 지키지 않음"
  >     - "무례한 언행"
  >
  >   ```
  >   {
  >       "rate": "5",
  >       "report": "게임에 참가하지 않음"
  >   }
  >   ```
  >
  > - 실패 시 response
  >
  >   ```
  >   - rate가 1~5 사이의 정수가 아닐 경우 + report가 유효하지 않을 경우
  >   {
  >       "statusCode": 400,
  >       "message": [
  >           "rate must not be less than 1",
  >           "rate must be an integer number",
  >           "report must be a valid enum value"
  >       ],
  >       "error": "Bad Request"
  >   }
  >
  >   - teamType가 'A' 또는 'B'가 아닌 경우
  >   {
  >       "statusCode": 400,
  >       "message": "TeamType is invalid format : ${teamType}",
  >       "error": "Bad Request"
  >   }
  >
  >   - uuid에 해당하는 리뷰가 없는 경우
  >   {
  >       "statusCode": 404,
  >       "message": "Review ${reviewId} is not exist",
  >       "error": "Not Found"
  >   }
  >
  >   - 게임 종료로부터 24시간이 지난 게임을 리뷰하려고 하는 경우
  >   {
  >       "statusCode": 403,
  >       "message": "Reviews cannot be edited for games that have been 24 hours since the game or have been blocked : ${review.uuid}",
  >       "error": "Forbidden"
  >   }
  >
  >   - 유효하지 않은 포지션을 요청한 경우
  >   {
  >       "statusCode": 404,
  >       "message": "Invalid Position : ${position}",
  >       "error": "Not Found"
  >   }
  >
  >   - 아직 주장이 게임 종료를 요청하지 않은 경우
  >   {
  >       "statusCode": 403,
  >       "message": "Can't review games that haven't finished yet : ${review.uuid}",
  >       "error": "Forbidden"
  >   }
  >
  >   - 자기 자신을 리뷰하려는 경우
  >   {
  >       "statusCode": 403,
  >       "message": "You can't rate yourself",
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
