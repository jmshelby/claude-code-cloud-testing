(ns hello.core
  (:require [clojure.string :as str]
            [clojure.tools.cli :refer [parse-opts]])
  (:gen-class))

(def cli-options
  [["-n" "--name NAME" "Name to greet"
    :default "World"]
   ["-v" "--verbose" "Enable verbose output"]
   ["-h" "--help" "Show help"]])

(defn usage [options-summary]
  (->> ["Usage: hello [options]"
        ""
        "Options:"
        options-summary]
       (str/join \newline)))

(defn greet [name verbose?]
  (when verbose?
    (println "Verbose mode enabled"))
  (println (str "Hello, " name "!")))

(defn -main [& args]
  (let [{:keys [options errors summary]} (parse-opts args cli-options)]
    (cond
      (:help options)
      (do (println (usage summary)) (System/exit 0))

      errors
      (do (doseq [err errors] (println err))
          (System/exit 1))

      :else
      (greet (:name options) (:verbose options)))))
