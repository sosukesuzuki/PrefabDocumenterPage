import { take, put, fork, call } from "redux-saga/effects";
import actionCreators, { ActionTypes } from "./actionCreators";
import { SagaIterator } from "redux-saga";
import { Row } from "./types";

declare var window: Window & {
  SQL: any;
};

function getDBFromFile(file: File): Promise<any> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = function() {
      const units = new Uint8Array(reader.result as ArrayBuffer);
      const db = new window.SQL.Database(units);
      resolve(db);
    };
    reader.readAsArrayBuffer(file);
  });
}

function* uploadDBFileSaga(): SagaIterator {
  while (true) {
    const { payload } = yield take(ActionTypes.UPLOAD_DB_FILE);
    const { file } = payload;
    const db: any = yield call(getDBFromFile, file);
    const stmt = db.prepare("select * from Document");
    stmt.getAsObject({
      $guid: 1,
      $filename: 2,
      $filepath: 3,
      $indentLevel: 4,
      $description: 5
    });
    stmt.bind({
      $guid: 1,
      $filename: 2,
      $filepath: 3,
      $indentLevel: 4,
      $description: 5
    });
    const rows: Row[] = [];
    while (stmt.step()) {
      const row = stmt.getAsObject();
      rows.push(row);
    }
    yield put(actionCreators.addDBToStore(rows));
    stmt.free();
  }
}

export default function* rootSaga(): SagaIterator {
  yield fork(uploadDBFileSaga);
}
