import { Access } from 'payload';

export const isEditor: Access = ({ req: { user } }) => Boolean(user);
