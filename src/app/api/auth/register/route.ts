import { NextResponse } from "next/server";
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();


type RegisterRequest = {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone: string;
};

async function createDefaultOrg(firstName: string, user: any){
    const orgName = `${firstName}'s Organisation`;
    const org = await prisma.organisation.create({
      data: {
        orgId: `org_${Date.now()}`,
        name: orgName,
        users: {
          connect: { id: user.id }
        }
      }
    });
    return org;
}



export async function POST(request: any){
    const {firstName, lastName, email, password, phone}  = await request.json() as RegisterRequest;

    // Validate the request
    if(!firstName || !lastName || !email || !password || !phone){
        return NextResponse.json({ 
            errors: [
            { field: 'firstName', message: 'First name is required' },
            { field: 'lastName', message: 'Last name is required' },
            { field: 'email', message: 'Email is required' },
            { field: 'password', message: 'Password is required' }
          ]}, {status: 422})
    }

    // Remove white spaces
    const trimmedFirstName = firstName.trim();
    const trimmedLastName = lastName.trim();
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();
    const trimmedPhone = phone.trim();

    const hashedPassword = await bcrypt.hash(trimmedPassword, 12);

    try {
        const user = await prisma.user.create({
            data: {
              userId: `user_${Date.now()}`,
              firstName,
              lastName,
              email,
              password: hashedPassword,
              phone
            }
          });


        // Create default organisation
        const org = await createDefaultOrg(firstName, user);

        return NextResponse.json({
            message: 'Registration successful',
            data: {
                accessToken: 'access_token_here',
                user: {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone,
                    org: {
                        id: org.id,
                        name: org.name
                    }
                },
            }
        });
    } catch (error: any) {
        if(error.code === 'P2002'){
            return NextResponse.json({ errors: [{ field: 'email', message: 'Email already exists' }]}, { status: 422 });
        }
        return NextResponse.json({ errors: [{ field: 'email', message: 'Something went wrong' }]}, { status: 500 });
    }




}