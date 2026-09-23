'use client';

import React, { useState } from 'react';
import { AuditLog } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format, parseISO } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface AuditTableProps {
  logs: AuditLog[];
}

export function AuditTable({ logs }: AuditTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');

  const filteredLogs = logs.filter(log => {
    const matchesSearch = (log.user?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (log.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesEntity = entityFilter === 'all' || log.entity_type === entityFilter;
    
    return matchesSearch && matchesAction && matchesEntity;
  });

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'create': return <Badge className="bg-emerald-100 text-emerald-800 border-0 hover:bg-emerald-200">Create</Badge>;
      case 'update': return <Badge className="bg-blue-100 text-blue-800 border-0 hover:bg-blue-200">Update</Badge>;
      case 'delete': return <Badge className="bg-rose-100 text-rose-800 border-0 hover:bg-rose-200">Delete</Badge>;
      case 'approve': return <Badge className="bg-emerald-100 text-emerald-800 border-0 hover:bg-emerald-200">Approve</Badge>;
      case 'reject': return <Badge className="bg-rose-100 text-rose-800 border-0 hover:bg-rose-200">Reject</Badge>;
      case 'login': return <Badge className="bg-slate-100 text-slate-800 border-0 hover:bg-slate-200">Login</Badge>;
      default: return <Badge variant="outline" className="capitalize">{action}</Badge>;
    }
  };

  // Extract unique actions and entities for filters
  const uniqueActions = Array.from(new Set(logs.map(log => log.action)));
  const uniqueEntities = Array.from(new Set(logs.map(log => log.entity_type)));

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between gap-4 bg-white p-4 rounded-md border border-slate-200 shadow-sm">
        <div className="relative w-full sm:w-1/3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            type="text"
            placeholder="Search logs..."
            className="pl-9 bg-slate-50 border-slate-200"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <select
            className="flex h-10 w-full sm:w-40 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
          >
            <option value="all">All Actions</option>
            {uniqueActions.map(action => (
              <option key={action} value={action} className="capitalize">{action}</option>
            ))}
          </select>
          
          <select
            className="flex h-10 w-full sm:w-40 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            value={entityFilter}
            onChange={(e) => setEntityFilter(e.target.value)}
          >
            <option value="all">All Entities</option>
            {uniqueEntities.map(entity => (
              <option key={entity || 'unknown'} value={entity || ''} className="capitalize">{entity || 'Unknown'}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-md border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow>
              <TableHead className="font-semibold text-slate-700 w-[180px]">Timestamp</TableHead>
              <TableHead className="font-semibold text-slate-700">User</TableHead>
              <TableHead className="font-semibold text-slate-700">Action</TableHead>
              <TableHead className="font-semibold text-slate-700">Entity</TableHead>
              <TableHead className="font-semibold text-slate-700">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length > 0 ? (
              filteredLogs.map((log) => (
                <TableRow key={log.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell className="text-sm text-slate-500 font-mono">
                    {format(parseISO(log.created_at), 'MMM dd, yyyy HH:mm:ss')}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900">{log.user?.full_name || 'System User'}</span>
                      <span className="text-xs text-slate-500 capitalize">{log.user?.role?.replace('_', ' ') || log.user_role?.replace('_', ' ') || 'Unknown'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{getActionBadge(log.action)}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="capitalize text-sm font-medium text-slate-700">{log.entity_type || '-'}</span>
                      {log.entity_id && (
                        <span className="text-xs text-slate-400 font-mono" title={log.entity_id}>
                          {log.entity_id.substring(0, 8)}...
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-slate-600">
                    {log.description || '-'}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                  No audit logs found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
