import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getEmployeeStats } from '@/data/employees-full';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faUserCheck, faUserClock, faUserTimes, faFileAlt, faGraduationCap, faGlobe } from '@fortawesome/free-solid-svg-icons';

export const EmployeeStats: React.FC = () => {
  const stats = getEmployeeStats();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Dossier complet': return faUserCheck;
      case 'Dossier à completer': return faUserClock;
      case 'En stage': return faGraduationCap;
      default: return faFileAlt;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Dossier complet': return 'text-green-600';
      case 'Dossier à completer': return 'text-yellow-600';
      case 'En stage': return 'text-blue-600';
      case 'En formation': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Vue d'ensemble */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FontAwesomeIcon icon={faUsers} className="mr-2 text-blue-600" />
            Vue d'ensemble des employés
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Total employés</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {stats.byStatus['Dossier complet'] || 0}
              </div>
              <div className="text-sm text-gray-600">Dossiers complets</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">
                {stats.byStatus['Dossier à completer'] || 0}
              </div>
              <div className="text-sm text-gray-600">À compléter</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {stats.byStatus['En stage'] || 0}
              </div>
              <div className="text-sm text-gray-600">En stage</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Répartition par statut */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par statut du dossier</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.byStatus).map(([status, count]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FontAwesomeIcon 
                      icon={getStatusIcon(status)} 
                      className={`mr-2 ${getStatusColor(status)}`} 
                    />
                    <span className="text-sm">{status}</span>
                  </div>
                  <Badge variant="secondary">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Répartition par type de contrat */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par type de contrat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.byContract).map(([contract, count]) => (
                <div key={contract} className="flex items-center justify-between">
                  <span className="text-sm">{contract}</span>
                  <Badge variant={contract === 'CDI' ? 'default' : 'secondary'}>
                    {count}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Répartition par genre */}
        <Card>
          <CardHeader>
            <CardTitle>Répartition par genre</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.byGender).map(([gender, count]) => (
                <div key={gender} className="flex items-center justify-between">
                  <span className="text-sm">{gender}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Répartition par nationalité */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FontAwesomeIcon icon={faGlobe} className="mr-2" />
              Répartition par nationalité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.byNationality)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 10)
                .map(([nationality, count]) => (
                <div key={nationality} className="flex items-center justify-between">
                  <span className="text-sm">{nationality}</span>
                  <Badge variant="outline">{count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

