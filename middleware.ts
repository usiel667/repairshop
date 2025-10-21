import { withAuth } from "@kinde-oss/kinde-auth-nextjs/middleware";
import { NextRequest } from "next/server";

export default withAuth(
  async function middleware(request: NextRequest) {
    // Console.log(request)
  },
  {
    isReturnToCurrentPage: true,
  },
);

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|robots.txt|images|login|$).*)",
  ],
};
