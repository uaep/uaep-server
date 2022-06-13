export const DOMAIN = ['gmail.com', 'naver.com'];

export enum GENDER {
  MALE = '남성',
  FEMALE = '여성',
  ANY = '성별 무관',
}

export enum PROVINCE {
  SEOUL = '서울특별시',
  BUSAN = '부산광역시',
  DAEGU = '대구광역시',
  INCHEON = '인천광역시',
  GWANGJU = '광주광역시',
  DAEJEON = '대전광역시',
  ULSAN = '울산광역시',
  SEJONG = '세종특별자치시',
  GYEONGGI = '경기도',
  GANGWON = '강원도',
  CHUNGCHEONGBUK = '충청북도',
  CHUNGCHEONGNAM = '충청남도',
  JEOLLABUK = '전라북도',
  JEOLLANAM = '전라남도',
  GYEONGSANGBUK = '경상북도',
  GYEONGSANGNAM = '경상남도',
  JEJU = '제주특별자치도',
}

export enum REGION_FILTER {
  SEOUL = '서울',
  GYEONGGI_GANGWON = '경기/강원',
  INCHEON = '인천',
  DAEJEON_SEJONG_CHUNGCHEONG = '대전/세종/충청',
  DAEGU_GYEONGSANGBUK = '대구/경북',
  BUSAN_ULSAN_GYEONGSANGNAM = '부산/울산/경남',
  GWANGJU_JEOLLA = '광주/전라',
  JEJU = '제주',
}

export enum LEVEL {
  S1 = '스타터1', // level_point : 0 ~ 2
  S2 = '스타터2', // level_point : 2 ~ 4
  S3 = '스타터3', // level_point : 4 ~ 6
  B1 = '비기너1', // level_point : 6 ~ 10
  B2 = '비기너2', // level_point : 10 ~ 14
  B3 = '비기너3', // level_point : 14 ~ 18
  A1 = '아마추어1', // level_point : 18 ~ 26
  A2 = '아마추어2', // level_point : 26 ~ 34
  A3 = '아마추어3', // level_point : 34 ~ 42
  SP1 = '세미프로1', // level_point : 42 ~ 58
  SP2 = '세미프로2', // level_point : 58 ~ 74
  SP3 = '세미프로3', // level_point : 74 ~ 90
  P1 = '프로1', // level_point : 90 ~ 122
  P2 = '프로2', // level_point : 122 ~ 154
  P3 = '프로3', // level_point : 154 ~
}

export enum LEVEL_POINT {
  스타터1 = 0, // level_point : 0 ~ 2
  스타터2 = 2, // level_point : 2 ~ 4
  스타터3 = 4, // level_point : 4 ~ 6
  비기너1 = 6, // level_point : 6 ~ 10
  비기너2 = 10, // level_point : 10 ~ 14
  비기너3 = 14, // level_point : 14 ~ 18
  아마추어1 = 18, // level_point : 18 ~ 26
  아마추어2 = 26, // level_point : 26 ~ 34
  아마추어3 = 34, // level_point : 34 ~ 42
  세미프로1 = 42, // level_point : 42 ~ 58
  세미프로2 = 58, // level_point : 58 ~ 74
  세미프로3 = 74, // level_point : 74 ~ 90
  프로1 = 90, // level_point : 90 ~ 122
  프로2 = 122, // level_point : 122 ~ 154
  프로3 = 154, // level_point : 154 ~
}

export enum LEVEL_LIMIT {
  ALL = '모든 레벨',
  BELOW_B3 = '비기너3 이하',
  HIGHER_SP1 = '세미프로1 이상',
}

export enum POSITION {
  FORWARD = 'FW',
  MIDFIELDER = 'MF',
  DEFENDER = 'DF',
  GOALKEEPER = 'GK',
}

export enum FORMATIONS_6v6 {
  F221 = '2-2-1',
  F212 = '2-1-2',
  F131 = '1-3-1',
}

export enum FORMATIONS_5v5 {
  F121 = '1-2-1',
  F202 = '2-0-2',
  F211 = '2-1-1',
  F112 = '1-1-2',
}

export enum PLAYER_NUMBERS {
  v6 = '6v6',
  v5 = '5v5',
}

export enum GAME_STATUS {
  AVAILABLE = '참가 가능',
  CLOSED = '마감',
}

export enum REVIEW_STATUS {
  NOT_FINISHED = '게임 종료 안됨',
  REVIEW = '리뷰 쓰기',
  DONE = '완료',
}

export enum REVIEW_REPORT {
  NO_SHOW = '게임에 참가하지 않음',
  BAD_MANNERS = '비매너 플레이',
  POSITION = '본인의 포지션을 지키지 않음',
  RUDE = '무례한 언행',
}
