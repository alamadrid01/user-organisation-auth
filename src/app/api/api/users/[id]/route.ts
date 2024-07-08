import jwt from "jsonwebtoken"
import { NextResponse } from "next/server"


export async function GET(request: any) {
    const id = await request.nextUrl.pathname.split('/')[4]
    console.log(id)
    return NextResponse.json({message: 'User found'}, {status: 200})
}
