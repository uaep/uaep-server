export const DOMAIN = ['gmail.com', 'naver.com'];

export enum GENDER {
  MALE = '남성',
  FEMALE = '여성',
  ANY = '성별 무관',
}

export enum POSITION {
  FORWARD = 'FW',
  MIDFIELDER = 'MF',
  DEFENDER = 'DF',
  GOALKEEPER = 'GK',
}

export enum FORMATIONS {
  F221 = '2-2-1',
  F212 = '2-1-2',
  F131 = '1-3-1',
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
