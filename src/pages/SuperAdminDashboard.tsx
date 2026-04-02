import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { loadUsers, saveUsers } from "@/features/auth/storage";
import type { User, Role } from "@/features/auth/types";
import * as XLSX from "xlsx";
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const ROLES: Role[] = ["super_admin", "web_master", "usuario_registrado"];

export default function SuperAdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    setUsers(loadUsers());
  }, []);

  const handleRoleChange = (userId: string, newRole: Role) => {
    const updatedUsers = users.map(u => u.id === userId ? { ...u, role: newRole } : u);
    setUsers(updatedUsers);
    saveUsers(updatedUsers);
    toast({
      title: "Rol Actualizado",
      description: "El rol del usuario ha sido guardado exitosamente.",
    });
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(users.map(u => ({
      ID: u.id,
      Nombre: u.nombre,
      Email: u.email,
      Role: u.role,
      Activado: u.activated ? "Sí" : "No",
      Fecha_Creacion: new Date(u.createdAt).toLocaleDateString(),
    })));
    
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Usuarios");
    // Generate buffer and trigger download
    XLSX.writeFile(workbook, "Usuarios_Backup.xlsx");
    
    toast({
      title: "Backup Exportado",
      description: "La base de datos de usuarios ha sido exportada en formato Excel.",
    });
  };

  const roleCounts: Record<string, number> = users.reduce((acc, current) => {
    acc[current.role] = (acc[current.role] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statData = ROLES.map(r => ({ name: r, value: roleCounts[r] || 0 }));
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Super Admin Dashboard
        </h1>
        <Button onClick={exportToExcel} variant="outline" className="shadow-sm">
          Exportar Usuarios (Excel)
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-lg border-none bg-white/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Usuarios por Rol</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip cursor={{fill: 'transparent'}} />
                <Bar dataKey="value" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-none bg-white/50 backdrop-blur">
          <CardHeader>
            <CardTitle>Distribución de Usuarios</CardTitle>
          </CardHeader>
          <CardContent className="h-64 flex justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value" label>
                  {statData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg border-none">
        <CardHeader>
          <CardTitle>Gestión de Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Rol Actual</TableHead>
                  <TableHead>Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map(u => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.nombre}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>{u.role}</TableCell>
                    <TableCell>
                      <Select defaultValue={u.role} onValueChange={(val: Role) => handleRoleChange(u.id, val)}>
                        <SelectTrigger className="w-[180px]">
                          <SelectValue placeholder="Seleccionar Rol" />
                        </SelectTrigger>
                        <SelectContent>
                          {ROLES.map(r => (
                            <SelectItem key={r} value={r}>
                              {r}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
