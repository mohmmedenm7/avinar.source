export interface Post {
    _id: string;
    title: string;
    content: string;
    category: string;
    tags: string[];
    author: {
        _id: string;
        name: string;
        email: string;
    };
    likes: string[];
    replies: Reply[];
    createdAt: string;
    updatedAt: string;
}

export interface Reply {
    _id: string;
    content: string;
    author: {
        _id: string;
        name: string;
        email: string;
    };
    createdAt: string;
}

export interface CreatePostData {
    title: string;
    content: string;
    category: string;
    tags: string[];
}

export interface UpdatePostData {
    title?: string;
    content?: string;
    category?: string;
    tags?: string[];
}

export interface CreateReplyData {
    content: string;
}
