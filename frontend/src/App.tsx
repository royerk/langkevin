import { useState } from "react";
import { Header } from "./components/layout/Header";
import { DatasetList } from "./components/datasets/DatasetList";
import { ExampleViewer } from "./components/examples/ExampleViewer";
import { AlignmentEditor } from "./components/alignment/AlignmentEditor";
import { Button } from "./components/ui/Button";
import { SearchInput } from "./components/ui/SearchInput";
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
    page,
    pageSize,
    total,
    setPage,
    setPageSize,
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
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedDataset?.name ?? "Examples"}
              </h2>
              {selectedDataset?.description && (
                <p className="text-sm text-gray-600 mt-1">
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
              total={total}
              page={page}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
