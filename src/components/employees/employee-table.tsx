'use client';

import React, { useState } from 'react';
import { Employee } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Eye } from 'lucide-react';

interface EmployeeTableProps {
  employees: Employee[];
}

export function EmployeeTable({ employees }: EmployeeTableProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (emp.department?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-100 text-emerald-700';
      case 'on_leave': return 'bg-amber-100 text-amber-700';
      case 'inactive': return 'bg-slate-100 text-slate-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'available': return 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200';
      case 'busy': return 'bg-amber-100 text-amber-700 hover:bg-amber-200';
      case 'on_leave': return 'bg-rose-100 text-rose-700 hover:bg-rose-200';
      default: return 'bg-slate-100 text-slate-700 hover:bg-slate-200';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-white p-4 rounded-md border border-slate-200 shadow-sm">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Search employees..."
            className="pl-9 bg-slate-50 border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden hidden md:block">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700">ID</TableHead>
              <TableHead className="font-semibold text-slate-700">Name</TableHead>
              <TableHead className="font-semibold text-slate-700">Department</TableHead>
              <TableHead className="font-semibold text-slate-700">Role</TableHead>
              <TableHead className="font-semibold text-slate-700">Skills</TableHead>
              <TableHead className="font-semibold text-slate-700">Availability</TableHead>
              <TableHead className="font-semibold text-slate-700">Status</TableHead>
              <TableHead className="font-semibold text-slate-700 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length > 0 ? (
              filteredEmployees.map((employee) => (
                <TableRow key={employee.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="font-medium text-slate-500 text-xs">{employee.id.substring(0, 8)}</TableCell>
                  <TableCell className="font-medium text-slate-900">{employee.name}</TableCell>
                  <TableCell>{employee.department?.name}</TableCell>
                  <TableCell className="capitalize">{employee.role.replace('_', ' ')}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {employee.skills.slice(0, 3).map(skill => (
                        <Badge key={skill} variant="secondary" className="text-[10px] py-0 px-1.5 h-5 bg-slate-100 text-slate-600">
                          {skill}
                        </Badge>
                      ))}
                      {employee.skills.length > 3 && (
                        <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-5 bg-slate-100 text-slate-600">
                          +{employee.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize border-0 ${getAvailabilityColor(employee.availability)}`}>
                      {employee.availability}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`capitalize border-0 ${getStatusColor(employee.status)}`}>
                      {employee.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-primary">
                      <Eye className="h-4 w-4" />
                      <span className="sr-only">View</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center text-slate-500">
                  No employees found matching your search.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view */}
      <div className="md:hidden space-y-3">
        {filteredEmployees.length > 0 ? (
          filteredEmployees.map((employee) => (
            <div key={employee.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-slate-900">{employee.name}</h3>
                  <p className="text-sm text-slate-500">{employee.department?.name} • <span className="capitalize">{employee.role.replace('_', ' ')}</span></p>
                </div>
                <Badge variant="outline" className={`capitalize border-0 ${getStatusColor(employee.status)}`}>
                  {employee.status.replace('_', ' ')}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {employee.skills.map(skill => (
                  <Badge key={skill} variant="secondary" className="text-[10px] py-0 px-1.5 h-5 bg-slate-100 text-slate-600">
                    {skill}
                  </Badge>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <Badge variant="outline" className={`capitalize border-0 ${getAvailabilityColor(employee.availability)}`}>
                  Availability: {employee.availability}
                </Badge>
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  View Profile
                </Button>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white p-8 rounded-lg border border-slate-200 text-center text-slate-500">
            No employees found.
          </div>
        )}
      </div>
    </div>
  );
}
