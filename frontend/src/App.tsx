import { useState } from "react";
import { Header } from "./components/layout/Header";
import { DatasetList } from "./components/datasets/DatasetList";
import { ExampleViewer } from "./components/examples/ExampleViewer";
import { AlignmentEditor } from "./components/alignment/AlignmentEditor";
import { Button } from "./components/ui/Button";
import { useDatasets } from "./hooks/useDatasets";
import { useExamples } from "./hooks/useExamples";

type View = "dataset-selection" | "alignment-editor";

function App() {
  const [view, setView] = useState<View>("dataset-selection");
  const [selectedDatasetId, setSelectedDatasetId] = useState<string | null>(
    null
  );

  const {
    datasets,
    loading: datasetsLoading,
    error: datasetsError,
    refetch: refetchDatasets,
  } = useDatasets();

  const {
    examples,
    loading: examplesLoading,
    error: examplesError,
    refetch: refetchExamples,
  } = useExamples(selectedDatasetId);

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId);

  const handleStartAligning = () => {
    setView("alignment-editor");
  };

  const handleBackToSelection = () => {
    setView("dataset-selection");
  };

  // Alignment editor view
  if (view === "alignment-editor" && selectedDataset) {
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col">
        <Header />
        <main className="flex-1 overflow-hidden">
          <AlignmentEditor
            dataset={selectedDataset}
            onBack={handleBackToSelection}
          />
        </main>
      </div>
    );
  }

  // Dataset selection view
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Header />
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 border-r border-gray-800 flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wide">
              Datasets
            </h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <DatasetList
              datasets={datasets}
              loading={datasetsLoading}
              error={datasetsError}
              selectedId={selectedDatasetId}
              onSelect={setSelectedDatasetId}
              onRetry={refetchDatasets}
            />
          </div>
        </aside>

        {/* Main content */}
        <section className="flex-1 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">
                {selectedDataset?.name ?? "Examples"}
              </h2>
              {selectedDataset?.description && (
                <p className="text-sm text-gray-400 mt-1">
                  {selectedDataset.description}
                </p>
              )}
            </div>
            {selectedDataset && (
              <Button onClick={handleStartAligning}>Start Aligning</Button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <ExampleViewer
              examples={examples}
              loading={examplesLoading}
              error={examplesError}
              hasSelection={!!selectedDatasetId}
              onRetry={refetchExamples}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
