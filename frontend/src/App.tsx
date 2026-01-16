import { useState } from "react";
import { Header } from "./components/layout/Header";
import { DatasetList } from "./components/datasets/DatasetList";
import { DatasetBadge } from "./components/datasets/DatasetBadge";
import { ExampleCard } from "./components/examples/ExampleCard";
import { AlignmentEditor } from "./components/alignment/AlignmentEditor";
import { Button } from "./components/ui/Button";
import { SearchInput } from "./components/ui/SearchInput";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";
import { ErrorMessage } from "./components/ui/ErrorMessage";
import { useDatasets } from "./hooks/useDatasets";
import { useExamples } from "./hooks/useExamples";
import { useFilteredDatasets } from "./hooks/useFilteredDatasets";

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

  const { filteredDatasets, searchQuery, setSearchQuery, hasSearchFilter } =
    useFilteredDatasets(datasets);

  const {
    examples,
    loading: examplesLoading,
    error: examplesError,
    refetch: refetchExamples,
  } = useExamples(selectedDatasetId);

  const selectedDataset = datasets.find((d) => d.id === selectedDatasetId);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const handleStartAligning = () => {
    setView("alignment-editor");
  };

  const handleBackToSelection = () => {
    setView("dataset-selection");
  };

  // Alignment editor view
  if (view === "alignment-editor" && selectedDataset) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />
      <main className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 border-r border-gray-200 bg-white flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-200 space-y-3">
            <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Datasets
            </h2>
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search datasets..."
            />
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <DatasetList
              datasets={filteredDatasets}
              loading={datasetsLoading}
              error={datasetsError}
              selectedId={selectedDatasetId}
              onSelect={setSelectedDatasetId}
              onRetry={refetchDatasets}
              hasSearchFilter={hasSearchFilter}
            />
          </div>
        </aside>

        {/* Main content */}
        <section className="flex-1 flex flex-col overflow-hidden bg-white">
          {selectedDataset ? (
            <>
              {/* Start Aligning button - prominent at top */}
              <div className="p-4 border-b border-gray-200">
                <Button onClick={handleStartAligning} className="w-full">
                  Start Aligning
                </Button>
              </div>

              {/* Dataset info section */}
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedDataset.name}
                </h2>
                {selectedDataset.description && (
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedDataset.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                  {selectedDataset.data_type && (
                    <DatasetBadge type={selectedDataset.data_type} />
                  )}
                  <span>·</span>
                  <span>{selectedDataset.example_count ?? 0} examples</span>
                  <span>·</span>
                  <span>Created {formatDate(selectedDataset.created_at)}</span>
                </div>
              </div>

              {/* Single example preview */}
              <div className="flex-1 overflow-y-auto p-4">
                <h3 className="text-sm font-medium text-gray-700 mb-3">
                  Example Preview
                </h3>
                {examplesLoading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : examplesError ? (
                  <ErrorMessage message={examplesError} onRetry={refetchExamples} />
                ) : examples.length > 0 ? (
                  <ExampleCard example={examples[0]} index={0} />
                ) : (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No examples in this dataset
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <p className="text-lg font-medium">Select a dataset</p>
                <p className="text-sm mt-1">
                  Choose a dataset from the list to preview examples
                </p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
