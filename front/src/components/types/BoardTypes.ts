interface PostDataType {
  postId: any;
  title: string;
  content: string;
  tag: string;
  date: any;
}

interface PostCardsProps {
  dummyData: BoardDataTypeList;
}

interface BoardDataTypeList {
  count: number;
  list: BoardDataType[];
  // boardId: any;
  // id: any;
  // title: string;
  // content: string;
  // nickName: string;
  // viewCount: any;
  // likeCount: number;
  // commentCount: number;
  // createdAt: any;
}

interface BoardDataType {
  boardId: any;
  userId: any;
  title: string;
  tag: string;
  content: string;
  //nickName: string;
  views: any;
  //likeCount: number;
  //commentCount: number;
  createdAt: any;
  updatedAt: any;
}

interface BoardCardType {
  id: any;
  post: BoardDataType;
}

interface boardListProps {
  boardList: BoardDataType[];
}

interface pageProps {
  totalContents: number;
  currentPage: number;
  paginate: any;
  contentsPerPage: number;
}
