import { PipelineSettings } from '../components/Settings/PipelineSettings';

export const SettingsPage = () => {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-serif font-bold text-gray-900 dark:text-white mb-2">Configurações</h1>
                <p className="text-gray-500 dark:text-gray-400">Gerencie as preferências da sua agência e do CRM.</p>
            </div>

            <PipelineSettings />
        </div>
    );
};
