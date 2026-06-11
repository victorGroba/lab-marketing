import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    papel?: string;
  }
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      papel: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    papel?: string;
  }
}
