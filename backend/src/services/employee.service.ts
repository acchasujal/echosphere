import { Prisma } from '@prisma/client';
import { prisma } from '../prisma/client.js';

const employeeInclude = {
  department: true,
} as const;

type EmployeeWithDepartment = Prisma.EmployeeGetPayload<{
  include: typeof employeeInclude;
}>;

type EmployeeWriteInput = {
  name: string;
  email: string;
  password: string;
  role: string;
  departmentId: number;
  xp?: number;
  points?: number;
};

type EmployeePatchInput = Partial<EmployeeWriteInput>;

function createError(message: string, statusCode: number): Error {
  const error = new Error(message);
  (error as Error & { statusCode?: number }).statusCode = statusCode;
  return error;
}

function sanitizeEmployee(employee: EmployeeWithDepartment) {
  const { password, ...employeeData } = employee;
  return employeeData;
}

function mapPrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw createError('An employee with this email already exists.', 409);
    }

    if (error.code === 'P2003') {
      throw createError('The provided departmentId is invalid.', 400);
    }

    if (error.code === 'P2025') {
      throw createError('Employee not found.', 404);
    }
  }

  throw error instanceof Error ? error : createError('Unexpected server error.', 500);
}

export async function getAllEmployees() {
  const employees = await prisma.employee.findMany({
    include: employeeInclude,
    orderBy: {
      id: 'asc',
    },
  });

  return employees.map(sanitizeEmployee);
}

export async function getEmployeeById(id: number) {
  const employee = await prisma.employee.findUnique({
    where: { id },
    include: employeeInclude,
  });

  if (!employee) {
    throw createError('Employee not found.', 404);
  }

  return sanitizeEmployee(employee);
}

export async function createEmployee(data: EmployeeWriteInput) {
  try {
    const employee = await prisma.employee.create({
      data,
      include: employeeInclude,
    });

    return sanitizeEmployee(employee);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function updateEmployee(id: number, data: EmployeePatchInput) {
  try {
    const employee = await prisma.employee.update({
      where: { id },
      data,
      include: employeeInclude,
    });

    return sanitizeEmployee(employee);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function deleteEmployee(id: number) {
  try {
    const employee = await prisma.employee.delete({
      where: { id },
      include: employeeInclude,
    });

    return sanitizeEmployee(employee);
  } catch (error) {
    mapPrismaError(error);
  }
}
