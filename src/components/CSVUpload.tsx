import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

interface CSVUploadProps {
    onDataLoaded: (csvText: string) => void;
}

export function CSVUpload({ onDataLoaded }: CSVUploadProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const processFile = useCallback(async (file: File) => {
        setIsProcessing(true);
        setError(null);
        setSuccess(false);

        try {
            const text = await file.text();
            console.log('File content preview:', text.substring(0, 500));

            // Basic validation
            if (!text.includes('Activity Date') && !text.includes('Instrument')) {
                throw new Error('This doesn\'t look like a valid trade CSV file. Please check the format.');
            }

            console.log('File validation passed, processing...');
            onDataLoaded(text);
            setSuccess(true);
        } catch (err) {
            console.error('Error processing file:', err);
            setError(err instanceof Error ? err.message : 'Failed to process file');
        } finally {
            setIsProcessing(false);
        }
    }, [onDataLoaded]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            processFile(files[0]);
        }
    }, [processFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
    }, []);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    }, [processFile]);

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="w-full max-w-2xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-8 animate-float">
                        <Upload className="h-12 w-12 text-white" />
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-4">
                        Upload Your Trade Data
                    </h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                        Drag and drop your CSV file or click to browse. We'll analyze your portfolio performance instantly.
                    </p>
                </div>

                {/* Upload Area */}
                <div
                    className={`upload-area relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${isDragOver
                        ? 'border-blue-400 bg-blue-500/10 scale-105'
                        : 'border-gray-600 bg-gray-800/50 hover:border-gray-500 hover:bg-gray-700/50'
                        }`}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                >
                    <input
                        type="file"
                        accept=".csv"
                        onChange={handleFileSelect}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isProcessing}
                    />

                    <div className="space-y-6">
                        {isProcessing ? (
                            <div className="space-y-4">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full animate-pulse">
                                    <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Processing Your Data</h3>
                                    <p className="text-gray-400">Analyzing your trades and calculating portfolio metrics...</p>
                                </div>
                            </div>
                        ) : success ? (
                            <div className="space-y-4">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full">
                                    <CheckCircle className="h-8 w-8 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">Data Uploaded Successfully!</h3>
                                    <p className="text-gray-400">Your portfolio analysis is ready.</p>
                                </div>
                            </div>
                        ) : (
                            <>
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-gray-600 to-gray-700 rounded-full group-hover:from-blue-500 group-hover:to-purple-600 transition-all duration-300">
                                    <FileText className="h-8 w-8 text-gray-300 group-hover:text-white transition-colors duration-300" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-white mb-2">
                                        {isDragOver ? 'Drop your file here' : 'Choose a CSV file or drag it here'}
                                    </h3>
                                    <p className="text-gray-400 mb-4">
                                        Supports CSV files from most brokerage platforms
                                    </p>
                                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                        <span>Drag and drop</span>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                        <span>Click to browse</span>
                                        <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                        <div className="flex items-center gap-3">
                            <AlertCircle className="h-5 w-5 text-red-400" />
                            <div>
                                <h4 className="font-semibold text-red-400">Upload Error</h4>
                                <p className="text-red-300 text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-lg">1</span>
                        </div>
                        <h3 className="font-semibold text-white mb-2">Export Your Data</h3>
                        <p className="text-gray-400 text-sm">Download your trade history as CSV from your brokerage account</p>
                    </div>

                    <div className="text-center p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-lg">2</span>
                        </div>
                        <h3 className="font-semibold text-white mb-2">Upload Here</h3>
                        <p className="text-gray-400 text-sm">Drag and drop your CSV file or click to browse</p>
                    </div>

                    <div className="text-center p-6 bg-gray-800/50 rounded-xl border border-gray-700">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                            <span className="text-white font-bold text-lg">3</span>
                        </div>
                        <h3 className="font-semibold text-white mb-2">Get Insights</h3>
                        <p className="text-gray-400 text-sm">View your portfolio performance, P&L analysis, and trading patterns</p>
                    </div>
                </div>
            </div>
        </div>
    );
} 