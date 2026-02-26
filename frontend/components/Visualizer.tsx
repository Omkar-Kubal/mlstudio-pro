"use client";

import React from "react";
import { getVisualConfig } from "@/adapters/visual-configs";
import { isPrimitiveRegistered, PrimitiveWrapper } from "@/visuals/learn/PrimitiveWrapper";


// Primitives
import FitProgressionPrimitive from "@/visuals/learn/FitProgressionPrimitive";
import DistributionEvolutionPrimitive from "@/visuals/learn/DistributionEvolutionPrimitive";
import BoundaryMorphingPrimitive from "@/visuals/learn/BoundaryMorphingPrimitive";
import MetricDashboardPrimitive from "@/visuals/learn/MetricDashboardPrimitive";
import ClusterFormationPrimitive from "@/visuals/learn/ClusterFormationPrimitive";
import NetworkForwardPassPrimitive from "@/visuals/learn/NetworkForwardPassPrimitive";
import GradientBackflowPrimitive from "@/visuals/learn/GradientBackflowPrimitive";
import GradientDescentOptimizer from "@/visuals/learn/GradientDescentOptimizer";
import DescriptiveStatisticsPrimitive from "@/visuals/learn/DescriptiveStatisticsPrimitive";
import PopulationSamplePrimitive from "@/visuals/learn/PopulationSamplePrimitive";
import CentralTendencyPrimitive from "@/visuals/learn/CentralTendencyPrimitive";
import DispersionPrimitive from "@/visuals/learn/DispersionPrimitive";
import ProbabilityDistributionsPrimitive from "@/visuals/learn/ProbabilityDistributionsPrimitive";
import CommonDistributionsPrimitive from "@/visuals/learn/CommonDistributionsPrimitive";
import ConditionalProbabilityPrimitive from "@/visuals/learn/ConditionalProbabilityPrimitive";
import LawOfLargeNumbersPrimitive from "@/visuals/learn/LawOfLargeNumbersPrimitive";
import PoissonDistributionPrimitive from "@/visuals/learn/PoissonDistributionPrimitive";
import ExponentialDistributionPrimitive from "@/visuals/learn/ExponentialDistributionPrimitive";
import UniformDistributionPrimitive from "@/visuals/learn/UniformDistributionPrimitive";
import VectorOperationsPrimitive from "@/visuals/learn/VectorOperationsPrimitive";
import MatrixTransformationPrimitive from "@/visuals/learn/MatrixTransformationPrimitive";
import MatrixPropertiesPrimitive from "@/visuals/learn/MatrixPropertiesPrimitive";
import LinearIndependencePrimitive from "@/visuals/learn/LinearIndependencePrimitive";
import EigenvectorsPrimitive from "@/visuals/learn/EigenvectorsPrimitive";
import SVDPrimitive from "@/visuals/learn/SVDPrimitive";
import ObjectiveFunctionPrimitive from "@/visuals/learn/ObjectiveFunctionPrimitive";
import GradientChainRulePrimitive from "@/visuals/learn/GradientChainRulePrimitive";
import NumpyArraysPrimitive from "@/visuals/learn/NumpyArraysPrimitive";
import BroadcastingPrimitive from "@/visuals/learn/BroadcastingPrimitive";
import FancyBooleanIndexingPrimitive from "@/visuals/learn/FancyBooleanIndexingPrimitive";
import MemoryLayoutPrimitive from "@/visuals/learn/MemoryLayoutPrimitive";
import GroupByPrimitive from "@/visuals/learn/GroupByPrimitive";
import RollingAveragePrimitive from "@/visuals/learn/RollingAveragePrimitive";
import MatplotlibSeabornPrimitive from "@/visuals/learn/MatplotlibSeabornPrimitive";
import ModelResultsPrimitive from "@/visuals/learn/ModelResultsPrimitive";
import DecoratorsPrimitive from "@/visuals/learn/DecoratorsPrimitive";
import GeneratorsPrimitive from "@/visuals/learn/GeneratorsPrimitive";
import ContextManagersPrimitive from "@/visuals/learn/ContextManagersPrimitive";
import MLPipelinesPrimitive from "@/visuals/learn/MLPipelinesPrimitive";
import OutlierDetectionPrimitive from "@/visuals/learn/OutlierDetectionPrimitive";
import DataValidationPrimitive from "@/visuals/learn/DataValidationPrimitive";
import CategoricalEncodingPrimitive from "@/visuals/learn/CategoricalEncodingPrimitive";
import FeatureScalingPrimitive from "@/visuals/learn/FeatureScalingPrimitive";
import PolynomialFeaturesPrimitive from "@/visuals/learn/PolynomialFeaturesPrimitive";
import MissingDataPrimitive from "@/visuals/learn/MissingDataPrimitive";
import DuplicateDataPrimitive from "@/visuals/learn/DuplicateDataPrimitive";
import ResidualAnalysisPrimitive from "@/visuals/learn/ResidualAnalysisPrimitive";
import FeatureSelectionPrimitive from "@/visuals/learn/FeatureSelectionPrimitive";
import DomainFeaturesPrimitive from "@/visuals/learn/DomainFeaturesPrimitive";
import TFIDFPrimitive from "@/visuals/learn/TFIDFPrimitive";
import CNNFeaturesPrimitive from "@/visuals/learn/CNNFeaturesPrimitive";
import LinearRegressionPrimitive from "@/visuals/learn/LinearRegressionPrimitive";
import RegularizationPrimitive from "@/visuals/learn/RegularizationPrimitive";
import DecisionTreePrimitive from "@/visuals/learn/DecisionTreePrimitive";
import RandomForestPrimitive from "@/visuals/learn/RandomForestPrimitive";
import GradientBoostingPrimitive from "@/visuals/learn/GradientBoostingPrimitive";
import SVRPrimitive from "@/visuals/learn/SVRPrimitive";
import KNNRegressionPrimitive from "@/visuals/learn/KNNRegressionPrimitive";
import RegressionMetricsPrimitive from "@/visuals/learn/RegressionMetricsPrimitive";
import LogisticRegressionPrimitive from "@/visuals/learn/LogisticRegressionPrimitive";
import DecisionTreeClassificationPrimitive from "@/visuals/learn/DecisionTreeClassificationPrimitive";
import SVMPrimitive from "@/visuals/learn/SVMPrimitive";
import NaiveBayesPrimitive from "@/visuals/learn/NaiveBayesPrimitive";
import KNNClassificationPrimitive from "@/visuals/learn/KNNClassificationPrimitive";
import ConfusionMatrixPrimitive from "@/visuals/learn/ConfusionMatrixPrimitive";
import ROCAUCPrimitive from "@/visuals/learn/ROCAUCPrimitive";
import EnsembleMethodsPrimitive from "@/visuals/learn/EnsembleMethodsPrimitive";
import NeuralNetworkPrimitive from "@/visuals/learn/NeuralNetworkPrimitive";
import ActivationFunctionPrimitive from "@/visuals/learn/ActivationFunctionPrimitive";
import CNNPrimitive from "@/visuals/learn/CNNPrimitive";
import RNNPrimitive from "@/visuals/learn/RNNPrimitive";
import AttentionPrimitive from "@/visuals/learn/AttentionPrimitive";
import TransformerPrimitive from "@/visuals/learn/TransformerPrimitive";
import DropoutBNPrimitive from "@/visuals/learn/DropoutBNPrimitive";
import TransferLearningPrimitive from "@/visuals/learn/TransferLearningPrimitive";
import NLPPipelinePrimitive from "@/visuals/learn/NLPPipelinePrimitive";
import WordEmbeddingPrimitive from "@/visuals/learn/WordEmbeddingPrimitive";
import TimeSeriesPrimitive from "@/visuals/learn/TimeSeriesPrimitive";
import AnomalyDetectionPrimitive from "@/visuals/learn/AnomalyDetectionPrimitive";
import RecommenderPrimitive from "@/visuals/learn/RecommenderPrimitive";
import ClusteringPrimitive from "@/visuals/learn/ClusteringPrimitive";
import MLOpsPrimitive from "@/visuals/learn/MLOpsPrimitive";
import AIEthicsPrimitive from "@/visuals/learn/AIEthicsPrimitive";

// Core components
import { CalculusVisualizer } from "./CalculusVisualizer";
import { OptimizationVisualizer } from "./OptimizationVisualizer";
import { NeuralVisualizer } from "./NeuralVisualizer";
import { MetricsVisualizer } from "./MetricsVisualizer";

interface VisualizerProps {
    topicTitle: string;
    module?: string;
    type?: string;
}

export const Visualizer = ({ topicTitle, module, type }: VisualizerProps) => {
    // 1. Try to get config from registry
    const config = getVisualConfig(topicTitle);

    if (config) {
        const primitiveType = ("primitiveType" in config ? config.primitiveType : "parameter-sensitivity");

        if (isPrimitiveRegistered(primitiveType)) {
            return (
                <PrimitiveWrapper
                    primitiveName={primitiveType}
                    caption={config.caption}
                    description={config.description}
                >
                    {renderPrimitive(primitiveType, config)}
                </PrimitiveWrapper>
            );
        }
    }

    // 2. Fallback to legacy type-based or module-based logic
    const renderFallback = () => {
        if (type === "calculus" || module?.includes("calculus")) {
            return <CalculusVisualizer functionType="parabola" />;
        }
        if (type === "sine") return <CalculusVisualizer functionType="sine" />;
        if (type === "cubic") return <CalculusVisualizer functionType="cubic" />;
        if (type === "optimization" || module?.includes("optimization")) return <OptimizationVisualizer />;
        if (type === "neural" || module?.includes("deep-learning") || module?.includes("neural")) return <NeuralVisualizer />;
        if (type === "metrics" || module?.includes("model-evaluation")) return <MetricsVisualizer />;

        if (module?.includes("statistics")) {
            return (
                <div className="flex items-end gap-2 h-24">
                    <div className="w-6 bg-primary/30 rounded-t animate-pulse" style={{ height: '40%' }} />
                    <div className="w-6 bg-primary/50 rounded-t animate-pulse" style={{ height: '70%', animationDelay: '0.1s' }} />
                    <div className="w-6 bg-primary/70 rounded-t animate-pulse" style={{ height: '55%', animationDelay: '0.2s' }} />
                    <div className="w-6 bg-primary rounded-t animate-pulse" style={{ height: '85%', animationDelay: '0.3s' }} />
                    <div className="w-6 bg-primary/60 rounded-t animate-pulse" style={{ height: '45%', animationDelay: '0.4s' }} />
                    <div className="w-6 bg-primary/40 rounded-t animate-pulse" style={{ height: '65%', animationDelay: '0.5s' }} />
                </div>
            );
        }

        return (
            <div className="relative size-32 flex items-center justify-center">
                <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                <div className="size-16 bg-primary/10 rounded-lg flex items-center justify-center border border-primary/30">
                    <span className="material-symbols-outlined text-primary scale-125">analytics</span>
                </div>
            </div>
        );
    };

    return (
        <div className="w-full h-full flex items-center justify-center p-4">
            {renderFallback()}
        </div>
    );
};

// Map primitive types to components
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderPrimitive(type: string, config: any) {
    switch (type) {
        case "fit-progression": return <FitProgressionPrimitive config={config} />;
        case "distribution-evolution": return <DistributionEvolutionPrimitive config={config} />;
        case "boundary-morphing": return <BoundaryMorphingPrimitive config={config} />;
        case "metric-dashboard": return <MetricDashboardPrimitive config={config} />;
        case "cluster-formation": return <ClusterFormationPrimitive config={config} />;
        case "network-forward-pass": return <NetworkForwardPassPrimitive config={config} />;
        case "gradient-backflow": return <GradientBackflowPrimitive config={config} />;
        case "gradient-descent-optimizer": return <GradientDescentOptimizer />;
        case "descriptive-statistics": return <DescriptiveStatisticsPrimitive />;
        case "population-sample": return <PopulationSamplePrimitive />;
        case "central-tendency": return <CentralTendencyPrimitive />;
        case "dispersion": return <DispersionPrimitive />;
        case "probability-distributions": return <ProbabilityDistributionsPrimitive />;
        case "common-distributions": return <CommonDistributionsPrimitive />;
        case "conditional-probability": return <ConditionalProbabilityPrimitive />;
        case "law-of-large-numbers": return <LawOfLargeNumbersPrimitive />;
        case "poisson-distribution": return <PoissonDistributionPrimitive />;
        case "exponential-distribution": return <ExponentialDistributionPrimitive />;
        case "uniform-distribution": return <UniformDistributionPrimitive />;
        case "vector-operations": return <VectorOperationsPrimitive />;
        case "matrix-transformation": return <MatrixTransformationPrimitive />;
        case "matrix-properties": return <MatrixPropertiesPrimitive />;
        case "linear-independence": return <LinearIndependencePrimitive />;
        case "eigen-vectors": return <EigenvectorsPrimitive />;
        case "svd": return <SVDPrimitive />;
        case "objective-function": return <ObjectiveFunctionPrimitive />;
        case "gradient-chain-rule": return <GradientChainRulePrimitive />;
        case "numpy-arrays": return <NumpyArraysPrimitive />;
        case "broadcasting": return <BroadcastingPrimitive />;
        case "fancy-boolean-indexing": return <FancyBooleanIndexingPrimitive />;
        case "memory-layout": return <MemoryLayoutPrimitive />;
        case "groupby": return <GroupByPrimitive />;
        case "rolling-average": return <RollingAveragePrimitive />;
        case "matplotlib-seaborn": return <MatplotlibSeabornPrimitive />;
        case "model-results": return <ModelResultsPrimitive />;
        case "decorators": return <DecoratorsPrimitive />;
        case "generators": return <GeneratorsPrimitive />;
        case "context-managers": return <ContextManagersPrimitive />;
        case "ml-pipelines": return <MLPipelinesPrimitive />;
        case "outlier-detection": return <OutlierDetectionPrimitive />;
        case "data-validation": return <DataValidationPrimitive />;
        case "categorical-encoding": return <CategoricalEncodingPrimitive />;
        case "feature-scaling": return <FeatureScalingPrimitive />;
        case "polynomial-features": return <PolynomialFeaturesPrimitive />;
        case "missing-data": return <MissingDataPrimitive />;
        case "duplicate-data": return <DuplicateDataPrimitive />;
        case "residual-analysis": return <ResidualAnalysisPrimitive />;
        case "feature-selection": return <FeatureSelectionPrimitive />;
        case "domain-features": return <DomainFeaturesPrimitive />;
        case "tfidf": return <TFIDFPrimitive />;
        case "cnn-features": return <CNNFeaturesPrimitive />;
        case "linear-regression": return <LinearRegressionPrimitive />;
        case "regularization": return <RegularizationPrimitive />;
        case "decision-tree": return <DecisionTreePrimitive />;
        case "random-forest": return <RandomForestPrimitive />;
        case "gradient-boosting": return <GradientBoostingPrimitive />;
        case "svr": return <SVRPrimitive />;
        case "knn-regression": return <KNNRegressionPrimitive />;
        case "regression-metrics": return <RegressionMetricsPrimitive />;
        case "logistic-regression": return <LogisticRegressionPrimitive />;
        case "decision-tree-classification": return <DecisionTreeClassificationPrimitive />;
        case "svm": return <SVMPrimitive />;
        case "naive-bayes": return <NaiveBayesPrimitive />;
        case "knn-classification": return <KNNClassificationPrimitive />;
        case "confusion-matrix": return <ConfusionMatrixPrimitive />;
        case "roc-auc": return <ROCAUCPrimitive />;
        case "ensemble-methods": return <EnsembleMethodsPrimitive />;
        case "neural-network": return <NeuralNetworkPrimitive />;
        case "activation-functions": return <ActivationFunctionPrimitive />;
        case "cnn": return <CNNPrimitive />;
        case "rnn": return <RNNPrimitive />;
        case "attention": return <AttentionPrimitive />;
        case "transformer": return <TransformerPrimitive />;
        case "dropout-bn": return <DropoutBNPrimitive />;
        case "transfer-learning": return <TransferLearningPrimitive />;
        case "nlp-pipeline": return <NLPPipelinePrimitive />;
        case "word-embedding": return <WordEmbeddingPrimitive />;
        case "time-series": return <TimeSeriesPrimitive />;
        case "anomaly-detection": return <AnomalyDetectionPrimitive />;
        case "recommender": return <RecommenderPrimitive />;
        case "clustering": return <ClusteringPrimitive />;
        case "mlops": return <MLOpsPrimitive />;
        case "ai-ethics": return <AIEthicsPrimitive />;
        default: return null;
    }
}
