  /*
  * Acronyms:
  * SL = supervised learning
  * mlModel = machine learning model/system
  */

  /**
   * @typedef {any[]} TrainingExample
   * @typedef {any} SlError
   */

  /**
   * @param {TrainingExample[]} trainingExamples_
   * @param {(expectedOutput: any, actualOutput: any) => SlError} trainingExampleErrorFn
   * @param {(mlModel: any, input: any, expectedOutput?: any) => any} mlModelPredictionFn
   * @param {() => void} onTrainingExamplesChangedFn
   * @param {(example: any[]) => string} exampleToStrFn
   * @param {(mlModel: any) => SlError} totalErrorBeforeAccumulationFn
   * @param {(totalErrorSoFar: SlError, errorFromNextExample: SlError) => SlError} accumulateTotalErrorFn
   * @param {(totalError: SlError, mlModel: any) => SlError} finalizeTotalErrorFn
   */
  export function initSlError(
    trainingExamples_,
    trainingExampleErrorFn,
    mlModelPredictionFn,
    onTrainingExamplesChangedFn,
    exampleToStrFn,
    totalErrorBeforeAccumulationFn,
    accumulateTotalErrorFn,
    finalizeTotalErrorFn
  ) {
    trainingExampleError = trainingExampleErrorFn;
    predict = mlModelPredictionFn;
    onTrainingExamplesChanged = onTrainingExamplesChangedFn;
    exampleToStr = exampleToStrFn;
    totalErrorBeforeAccumulation = totalErrorBeforeAccumulationFn;
    accumulateTotalError = accumulateTotalErrorFn;
    finalizeTotalError = finalizeTotalErrorFn;
    setTrainingExamples(trainingExamples_);
  }

  /**
   * read-only frozen variable, use setTrainingExamples to change this instead.
   * @type {TrainingExample[]} trainingExamples
   */
  export let trainingExamples;

  /**
   * @param {TrainingExample[]} trainingExamples_
   */
  export function setTrainingExamples(trainingExamples_) {
    trainingExamples = trainingExamples_;
    Object.freeze(trainingExamples);
    onTrainingExamplesChanged();
  }

  /**
   * @param {any} mlModel
   */
  export function slError(mlModel) {
    let totalError = totalErrorBeforeAccumulation(mlModel);
    for (const trainingExample of trainingExamples) {
      const input = trainingExample[0];
      const expectedOutput = trainingExample[1];
      const actualOutput = predict(mlModel, input, expectedOutput);
      totalError = accumulateTotalError(
        totalError,
        trainingExampleError(expectedOutput, actualOutput)
      );
    }
    totalError = finalizeTotalError(totalError, mlModel);
    return totalError;
  }

  /**
   * Returns a string representation of the training examples.
   */
  export function trainingExamplesToStr() {
    return trainingExamples.map(exampleToStr).join("\n");
  }

  /**
   * @type {(expectedOutput: any, actualOutput: any) => SlError}
   */
  let trainingExampleError;

  /**
   * @type {(mlModel: any, input: any, expectedOutput?: any) => any}
   */
  let predict;

  /**
   * @type {() => void}
   */
  let onTrainingExamplesChanged;

  /**
   * @type {(example: TrainingExample)=> string}}
   */
  let exampleToStr;

  /**
   * @type {(mlModel:any) => SlError}
   */
  let totalErrorBeforeAccumulation;

  /**
   * @type {(totalErrorSoFar: SlError, errorFromNextExample: SlError) => SlError}
   */
  let accumulateTotalError;

  /**
   * @type {(totalError: SlError, mlModel: any) => SlError}
   */
  let finalizeTotalError;
