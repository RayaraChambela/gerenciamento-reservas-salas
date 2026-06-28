export interface User{
    id: string;
    name: string;
    email: string;
    date: Date;
    pass: string;
}
//crudizin
export interface CreateUserDTO{
    name: string;
    email: string;
    senha: string;
}


export interface UpdateUserDTO{
    name?: string;
    email?: string;
}