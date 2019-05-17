import {Parser} from "jison";
import grammar from "./GrammarTable.js";

const parser = new Parser(grammar);

export default parser;
