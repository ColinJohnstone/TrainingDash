import React, { useState, useEffect } from 'react';
import { Activity, Upload, Calendar, Clock, MapPin, FileText } from 'lucide-react';

interface StravaWorkout {
  id: string;
  name: string;
  type: string;
  distance: number;
  duration: string;
  date: string;
  pace?: string;
  elevation?: number;
  location?: string;
}

const StravaLastWorkout: React.FC = () => {
  const [hasData, setHasData] = useState(false);
  const [lastWorkout, setLastWorkout] = useState<StravaWorkout | null>(null);
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => {
    // Check if user has imported data
    const importedData = localStorage.getItem('strava_data_imported') === 'true';
    const savedWorkout = localStorage.getItem('last_workout');
    
    setHasData(importedData);
    
    if (importedData && savedWorkout) {
      setLastWorkout(JSON.parse(savedWorkout));
    }
  }, []);

  const handleFileUpload = (file: File) => {
    setLoading(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        
        // Try to parse as JSON first (Strava export format)
        let workoutData;
        if (file.name.endsWith('.json')) {
          const jsonData = JSON.parse(content);
          workoutData = parseStravaJson(jsonData);
        } else if (file.name.endsWith('.gpx')) {
          workoutData = parseGpxFile(content);
        } else if (file.name.endsWith('.tcx')) {
          workoutData = parseTcxFile(content);
        } else {
          throw new Error('Unsupported file format. Please use JSON, GPX, or TCX files.');
        }
        
        setLastWorkout(workoutData);
        localStorage.setItem('strava_data_imported', 'true');
        localStorage.setItem('last_workout', JSON.stringify(workoutData));
        setHasData(true);
        setLoading(false);
      } catch (error) {
        console.error('Error parsing file:', error);
        alert('Error parsing file. Please check the format and try again.');
        setLoading(false);
      }
    };
    
    reader.readAsText(file);
  };

  const parseStravaJson = (data: any): StravaWorkout => {
    // Parse Strava JSON export format
    return {
      id: data.id || 'imported',
      name: data.name || 'Imported Workout',
      type: data.type || 'Run',
      distance: (data.distance / 1609.34) || 0, // Convert meters to miles
      duration: formatDuration(data.moving_time || data.elapsed_time || 0),
      date: data.start_date ? data.start_date.split('T')[0] : new Date().toISOString().split('T')[0],
      pace: calculatePace(data.distance, data.moving_time),
      elevation: Math.round((data.total_elevation_gain || 0) * 3.28084), // Convert meters to feet
      location: data.location_city || 'Unknown'
    };
  };

  const parseGpxFile = (content: string): StravaWorkout => {
    // Basic GPX parsing - you could enhance this with a proper XML parser
    const nameMatch = content.match(/<name>(.*?)<\/name>/);
    const timeMatch = content.match(/<time>(.*?)<\/time>/);
    
    return {
      id: 'gpx-import',
      name: nameMatch ? nameMatch[1] : 'GPX Import',
      type: 'Run', // Default to run, could be enhanced to detect activity type
      distance: 0, // Would need to calculate from track points
      duration: '00:00',
      date: timeMatch ? timeMatch[1].split('T')[0] : new Date().toISOString().split('T')[0],
      location: 'GPX Import'
    };
  };

  const parseTcxFile = (content: string): StravaWorkout => {
    // Basic TCX parsing
    const activityMatch = content.match(/<Activity Sport="(.*?)">/);
    const idMatch = content.match(/<Id>(.*?)<\/Id>/);
    
    return {
      id: 'tcx-import',
      name: 'TCX Import',
      type: activityMatch ? activityMatch[1] : 'Run',
      distance: 0,
      duration: '00:00',
      date: idMatch ? idMatch[1].split('T')[0] : new Date().toISOString().split('T')[0],
      location: 'TCX Import'
    };
  };

  const formatDuration = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const calculatePace = (distanceMeters: number, timeSeconds: number): string => {
    if (!distanceMeters || !timeSeconds) return '';
    
    const miles = distanceMeters / 1609.34;
    const paceSeconds = timeSeconds / miles;
    const minutes = Math.floor(paceSeconds / 60);
    const seconds = Math.floor(paceSeconds % 60);
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}/mi`;
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const mockImport = () => {
    setLoading(true);
    // Create mock data as if imported
    setTimeout(() => {
      const mockWorkout: StravaWorkout = {
        id: '12345',
        name: 'Morning Run in Aurora',
        type: 'Run',
        distance: 5.2,
        duration: '42:15',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        pace: '8:07/mi',
        elevation: 125,
        location: 'Aurora, ON'
      };
      setLastWorkout(mockWorkout);
      localStorage.setItem('strava_data_imported', 'true');
      localStorage.setItem('last_workout', JSON.stringify(mockWorkout));
      setHasData(true);
      setLoading(false);
    }, 1000);
  };

  const getActivityIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'run':
        return '🏃‍♂️';
      case 'ride':
      case 'bike':
        return '🚴‍♂️';
      case 'swim':
        return '🏊‍♂️';
      default:
        return '💪';
    }
  };

  const getActivityColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'run':
        return 'from-red-500/20 to-red-600/20 border-red-400';
      case 'ride':
      case 'bike':
        return 'from-green-500/20 to-green-600/20 border-green-400';
      case 'swim':
        return 'from-blue-500/20 to-blue-600/20 border-blue-400';
      default:
        return 'from-purple-500/20 to-purple-600/20 border-purple-400';
    }
  };

  if (!hasData) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity size={24} className="text-orange-400" />
            <h3 className="text-xl font-bold text-white">Last Workout</h3>
          </div>
          
          <div 
            className={`mb-4 p-6 border-2 border-dashed rounded-lg transition-all duration-200 ${
              dragOver 
                ? 'border-orange-400 bg-orange-500/10' 
                : 'border-gray-600 hover:border-orange-500/50 hover:bg-orange-500/5'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-3">
              <Upload size={24} className="text-orange-400" />
            </div>
            <p className="text-gray-300 mb-4 text-sm">
              Import your Strava data to see your latest workout and track your progress!
            </p>
            <p className="text-gray-400 text-xs mb-4">
              Drag & drop or click to upload: JSON, GPX, or TCX files
            </p>
            
            <input
              type="file"
              accept=".json,.gpx,.tcx"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            
            <div className="space-y-2">
              <label
                htmlFor="file-upload"
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-lg hover:shadow-xl border border-orange-500 hover:border-orange-400 cursor-pointer inline-flex items-center gap-2"
              >
                <FileText size={16} />
                Choose File
              </label>
              
              <div className="text-gray-500 text-xs">or</div>
              
              <button
                onClick={mockImport}
                disabled={loading}
                className="bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-gray-500 hover:border-gray-400 inline-flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <Activity size={16} />
                    Use Sample Data
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity size={24} className="text-orange-400" />
            <h3 className="text-xl font-bold text-white">Last Workout</h3>
          </div>
          <div className="flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-300">Loading your latest workout...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!lastWorkout) {
    return (
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Activity size={24} className="text-orange-400" />
            <h3 className="text-xl font-bold text-white">Last Workout</h3>
          </div>
          <p className="text-gray-400">No recent workouts found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl p-6 shadow-xl border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={24} className="text-orange-400" />
          <h3 className="text-xl font-bold text-white">Last Workout</h3>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span>Data Imported</span>
        </div>
      </div>

      <div className={`bg-gradient-to-r ${getActivityColor(lastWorkout.type)} rounded-lg p-4 border`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{getActivityIcon(lastWorkout.type)}</span>
            <div>
              <h4 className="font-bold text-white text-lg leading-tight">{lastWorkout.name}</h4>
              <p className="text-sm text-gray-300">{lastWorkout.type}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center gap-2 text-gray-300">
            <MapPin size={14} />
            <span>{lastWorkout.distance} miles</span>
          </div>
          <div className="flex items-center gap-2 text-gray-300">
            <Clock size={14} />
            <span>{lastWorkout.duration}</span>
          </div>
          {lastWorkout.pace && (
            <div className="flex items-center gap-2 text-gray-300">
              <Activity size={14} />
              <span>{lastWorkout.pace}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-gray-300">
            <Calendar size={14} />
            <span>{new Date(lastWorkout.date).toLocaleDateString()}</span>
          </div>
        </div>

        {lastWorkout.location && (
          <div className="mt-3 pt-3 border-t border-gray-600">
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <MapPin size={12} />
              <span>{lastWorkout.location}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => {
            localStorage.removeItem('strava_data_imported');
            localStorage.removeItem('last_workout');
            setHasData(false);
            setLastWorkout(null);
          }}
          className="flex-1 bg-gray-600/20 hover:bg-gray-600/30 text-gray-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-gray-600/30 hover:border-gray-500/50 flex items-center justify-center gap-2"
        >
          <Upload size={14} />
          Import New Data
        </button>
        
        {lastWorkout.id !== 'imported' && lastWorkout.id !== 'gpx-import' && lastWorkout.id !== 'tcx-import' && (
          <button
            onClick={() => window.open(`https://strava.com/activities/${lastWorkout.id}`, '_blank')}
            className="flex-1 bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border border-orange-600/30 hover:border-orange-500/50 flex items-center justify-center gap-2"
          >
            <Activity size={14} />
            View on Strava
          </button>
        )}
      </div>
    </div>
  );
};

export default StravaLastWorkout;